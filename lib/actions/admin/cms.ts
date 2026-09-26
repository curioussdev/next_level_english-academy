'use server'

import { revalidatePath } from 'next/cache'
import type { ContentType, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireModuleSession, type ActionState } from '@/lib/actions/admin/guard'
import {
  heroContentSchema,
  featuresContentSchema,
  stepsContentSchema,
  pricingIntroSchema,
  testimonialsHeaderSchema,
  footerContentSchema,
} from '@/lib/validators/cms'

/**
 * Upsert real (constraint única `page_contentType`) em vez do antigo
 * findFirst -> create/update manual — elimina a condição de corrida em que
 * duas gravações simultâneas podiam criar duas linhas para o mesmo tipo de
 * conteúdo.
 */
async function upsertCMSContent(
  contentType: ContentType,
  data: { title?: string | null; subtitle?: string | null; body?: Prisma.InputJsonValue }
) {
  await prisma.cMSContent.upsert({
    where: { page_contentType: { page: 'landing', contentType } },
    update: data,
    create: { page: 'landing', contentType, ...data },
  })
  revalidatePath('/admin/content/landing-page')
  revalidatePath('/')
}

function parseItems(formData: FormData, count: number, fields: string[]) {
  return Array.from({ length: count }, (_, i) =>
    Object.fromEntries(fields.map((field) => [field, formData.get(`item${i}${field[0].toUpperCase()}${field.slice(1)}`)]))
  )
}

export async function saveHeroContent(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireModuleSession('content')
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Não autorizado.' }
  }

  const parsed = heroContentSchema.safeParse({
    eyebrow: formData.get('eyebrow'),
    title: formData.get('title'),
    subtitle: formData.get('subtitle'),
    statText: formData.get('statText'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  await upsertCMSContent('HERO', {
    title: parsed.data.title,
    subtitle: parsed.data.subtitle,
    body: { eyebrow: parsed.data.eyebrow, statText: parsed.data.statText },
  })
}

export async function saveFeaturesContent(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireModuleSession('content')
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Não autorizado.' }
  }

  const parsed = featuresContentSchema.safeParse({
    eyebrow: formData.get('eyebrow'),
    headingMain: formData.get('headingMain'),
    headingHighlight: formData.get('headingHighlight'),
    paragraph: formData.get('paragraph'),
    calloutTitle: formData.get('calloutTitle'),
    calloutText: formData.get('calloutText'),
    items: parseItems(formData, 4, ['icon', 'title', 'text']),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const { eyebrow, headingMain, headingHighlight, paragraph, calloutTitle, calloutText, items } = parsed.data
  await upsertCMSContent('FEATURES', {
    body: { eyebrow, headingMain, headingHighlight, paragraph, calloutTitle, calloutText, items },
  })
}

export async function saveStepsContent(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireModuleSession('content')
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Não autorizado.' }
  }

  const parsed = stepsContentSchema.safeParse({
    eyebrow: formData.get('eyebrow'),
    heading: formData.get('heading'),
    items: parseItems(formData, 4, ['title', 'text']),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const { eyebrow, heading, items } = parsed.data
  await upsertCMSContent('STEPS', { body: { eyebrow, heading, items } })
}

export async function savePricingIntro(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireModuleSession('content')
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Não autorizado.' }
  }

  const parsed = pricingIntroSchema.safeParse({
    eyebrow: formData.get('eyebrow'),
    heading: formData.get('heading'),
    subtitle: formData.get('subtitle'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  await upsertCMSContent('PRICING', {
    title: parsed.data.heading,
    subtitle: parsed.data.subtitle,
    body: { eyebrow: parsed.data.eyebrow },
  })
}

export async function saveTestimonialsHeader(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireModuleSession('content')
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Não autorizado.' }
  }

  const parsed = testimonialsHeaderSchema.safeParse({
    eyebrow: formData.get('eyebrow'),
    heading: formData.get('heading'),
    ratingText: formData.get('ratingText'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  await upsertCMSContent('TESTIMONIALS', {
    title: parsed.data.heading,
    body: { eyebrow: parsed.data.eyebrow, ratingText: parsed.data.ratingText },
  })
}

export async function saveFooterContent(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireModuleSession('content')
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Não autorizado.' }
  }

  const parsed = footerContentSchema.safeParse({ copyrightText: formData.get('copyrightText') })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  await upsertCMSContent('FOOTER', { title: parsed.data.copyrightText })
}
