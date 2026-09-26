import { headers } from 'next/headers'
import { NextResponse, after } from 'next/server'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity'
import { sendEmail, CONTACT_EMAIL } from '@/lib/resend'
import { newPurchaseNotificationEmail } from '@/lib/email-templates'
import { formatCurrency } from '@/lib/format'
import { notifyStaffOfEvent } from '@/lib/actions/staff-notifications'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Assinatura ausente.' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET ?? '')
  } catch (err) {
    console.error('[stripe webhook] assinatura inválida:', err)
    return NextResponse.json({ error: 'Assinatura inválida.' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId ?? session.client_reference_id
      if (!userId) break

      // Stripe reenvia o mesmo evento em retries (timeout, 5xx) — sem isto,
      // cada reentrega duplicava a Transaction, o log de auditoria e contava
      // a receita duas vezes no dashboard.
      const alreadyProcessed = await prisma.transaction.findUnique({
        where: { stripeCheckoutSessionId: session.id },
        select: { id: true },
      })
      if (alreadyProcessed) break

      if (typeof session.customer === 'string') {
        await prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId: session.customer },
        })
      }

      if (session.mode === 'subscription' && typeof session.subscription === 'string') {
        await upsertSubscriptionFromStripeId(session.subscription, userId)
      }

      if (session.mode === 'payment') {
        const courseId = session.metadata?.courseId
        if (courseId) {
          await prisma.enrollment.upsert({
            where: { userId_courseId: { userId, courseId } },
            update: { status: 'ACTIVE' },
            create: { userId, courseId, status: 'ACTIVE' },
          })
        }
      }

      await prisma.transaction.upsert({
        where: { stripeCheckoutSessionId: session.id },
        update: {},
        create: {
          userId,
          amount: (session.amount_total ?? 0) / 100,
          currency: (session.currency ?? 'eur').toUpperCase(),
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
          status: 'PAID',
          type: session.mode === 'subscription' ? 'SUBSCRIPTION' : 'ONE_TIME',
        },
      })

      await logActivity(userId, 'PURCHASE', {
        entityType: session.mode === 'subscription' ? 'Subscription' : 'Course',
        entityId: session.metadata?.courseId ?? session.metadata?.planId,
        metadata: { amount: (session.amount_total ?? 0) / 100, mode: session.mode },
      })

      {
        const amountLabel = formatCurrency((session.amount_total ?? 0) / 100, (session.currency ?? 'eur').toUpperCase())
        const description =
          session.mode === 'subscription'
            ? `plano ${session.metadata?.planId ?? 'desconhecido'}`
            : `o curso "${session.metadata?.courseId ?? 'desconhecido'}"`

        // Stripe espera uma resposta rápida a este webhook (senão reenvia o
        // evento) — email e notificações correm depois de já termos
        // respondido 200, não antes.
        after(async () => {
          const buyer = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } })

          await prisma.notification
            .create({
              data: {
                userId,
                title: 'Compra confirmada',
                message: `A sua compra de ${description} foi confirmada. Bom estudo!`,
                type: 'SYSTEM',
              },
            })
            .catch(() => {})

          await notifyStaffOfEvent(
            'Nova compra confirmada',
            `${buyer ? (buyer.name ?? buyer.email) : userId} comprou ${description} (${amountLabel}).`,
            '/admin/sales',
          )

          if (CONTACT_EMAIL) {
            await sendEmail({
              to: CONTACT_EMAIL,
              subject: 'Nova compra confirmada — Next Level',
              html: newPurchaseNotificationEmail(buyer ? (buyer.name ?? buyer.email) : userId, description, amountLabel),
            })
          }
        })
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      await upsertSubscriptionFromStripeId(subscription.id, subscription.metadata?.userId)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: { status: 'canceled' },
      })
      break
    }

    default:
      break
  }

  return NextResponse.json({ received: true })
}

async function upsertSubscriptionFromStripeId(stripeSubscriptionId: string, fallbackUserId?: string) {
  const subscription = await getStripe().subscriptions.retrieve(stripeSubscriptionId)
  const userId = subscription.metadata?.userId ?? fallbackUserId
  if (!userId) return

  const currentPeriodEnd = subscription.items.data[0]?.current_period_end
  if (!currentPeriodEnd) return

  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    update: {
      status: subscription.status,
      currentPeriodEnd: new Date(currentPeriodEnd * 1000),
    },
    create: {
      userId,
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodEnd: new Date(currentPeriodEnd * 1000),
    },
  })
}
