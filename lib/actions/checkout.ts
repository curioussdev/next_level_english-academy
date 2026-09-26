'use server'

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'
import { isDemoUser } from '@/lib/demo'
import { getAppUrl } from '@/lib/env'
import type { PlanId } from '@/lib/plans'

// Os Price IDs ficam só no servidor — nunca expostos ao cliente.
const PLAN_PRICE_IDS: Record<PlanId, string | undefined> = {
  basic: process.env.STRIPE_PRICE_BASIC,
  pro: process.env.STRIPE_PRICE_PRO,
  premium: process.env.STRIPE_PRICE_PREMIUM,
}

export async function createPlanCheckoutSession(planId: PlanId) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/%23planos`)
  }

  const priceId = PLAN_PRICE_IDS[planId]
  if (!priceId) {
    throw new Error(
      `Price do Stripe não configurado para o plano "${planId}". Defina STRIPE_PRICE_${planId.toUpperCase()} no .env.`,
    )
  }

  if (isDemoUser(session.user.id)) {
    throw new Error('Modo demo: ligue um banco de dados real para testar o checkout.')
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } })
  const appUrl = getAppUrl()

  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    customer: user.stripeCustomerId ?? undefined,
    customer_email: user.stripeCustomerId ? undefined : user.email,
    client_reference_id: user.id,
    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/checkout/cancel`,
    metadata: { userId: user.id, planId },
    subscription_data: {
      metadata: { userId: user.id, planId },
    },
  })

  if (!checkoutSession.url) {
    throw new Error('Não foi possível criar a sessão de checkout do Stripe.')
  }

  redirect(checkoutSession.url)
}

export async function createCourseCheckoutSession(courseId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/student/courses`)
  }

  if (isDemoUser(session.user.id)) {
    throw new Error('Modo demo: ligue um banco de dados real para testar a compra de cursos.')
  }

  const course = await prisma.course.findUniqueOrThrow({ where: { id: courseId } })
  if (!course.stripePriceId) {
    throw new Error(`O curso "${course.title}" ainda não tem um Price do Stripe configurado.`)
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } })
  const appUrl = getAppUrl()

  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: course.stripePriceId, quantity: 1 }],
    customer: user.stripeCustomerId ?? undefined,
    customer_email: user.stripeCustomerId ? undefined : user.email,
    client_reference_id: user.id,
    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/checkout/cancel`,
    metadata: { userId: user.id, courseId: course.id },
  })

  if (!checkoutSession.url) {
    throw new Error('Não foi possível criar a sessão de checkout do Stripe.')
  }

  redirect(checkoutSession.url)
}
