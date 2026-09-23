import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

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
