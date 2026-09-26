import { z } from 'zod'
import { ICON_KEYS } from '@/lib/landing-icons'

export const testimonialSchema = z.object({
  authorName: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres.'),
  content: z.string().trim().min(10, 'Depoimento deve ter pelo menos 10 caracteres.'),
  rating: z.coerce.number().int().min(1).max(5),
})

export type TestimonialInput = z.infer<typeof testimonialSchema>

export const heroContentSchema = z.object({
  eyebrow: z.string().trim().min(2, 'Texto de destaque é obrigatório.'),
  title: z.string().trim().min(3, 'Título é obrigatório.'),
  subtitle: z.string().trim().min(3, 'Subtítulo é obrigatório.'),
  statText: z.string().trim().min(2, 'Texto de prova social é obrigatório.'),
})

export type HeroContentInput = z.infer<typeof heroContentSchema>

const featureItemSchema = z.object({
  icon: z.enum(ICON_KEYS as [string, ...string[]], { message: 'Ícone inválido.' }),
  title: z.string().trim().min(2, 'Título do cartão é obrigatório.'),
  text: z.string().trim().min(5, 'Texto do cartão é obrigatório.'),
})

export const featuresContentSchema = z.object({
  eyebrow: z.string().trim().min(2, 'Texto de destaque é obrigatório.'),
  headingMain: z.string().trim().min(2, 'Título é obrigatório.'),
  headingHighlight: z.string().trim().min(2, 'Destaque do título é obrigatório.'),
  paragraph: z.string().trim().min(5, 'Parágrafo é obrigatório.'),
  calloutTitle: z.string().trim().min(2, 'Título do destaque é obrigatório.'),
  calloutText: z.string().trim().min(2, 'Texto do destaque é obrigatório.'),
  items: z.array(featureItemSchema).length(4, 'São precisos exatamente 4 cartões.'),
})

export type FeaturesContentInput = z.infer<typeof featuresContentSchema>

const stepItemSchema = z.object({
  title: z.string().trim().min(2, 'Título do passo é obrigatório.'),
  text: z.string().trim().min(5, 'Texto do passo é obrigatório.'),
})

export const stepsContentSchema = z.object({
  eyebrow: z.string().trim().min(2, 'Texto de destaque é obrigatório.'),
  heading: z.string().trim().min(3, 'Título é obrigatório.'),
  items: z.array(stepItemSchema).length(4, 'São precisos exatamente 4 passos.'),
})

export type StepsContentInput = z.infer<typeof stepsContentSchema>

export const pricingIntroSchema = z.object({
  eyebrow: z.string().trim().min(2, 'Texto de destaque é obrigatório.'),
  heading: z.string().trim().min(3, 'Título é obrigatório.'),
  subtitle: z.string().trim().min(3, 'Subtítulo é obrigatório.'),
})

export type PricingIntroInput = z.infer<typeof pricingIntroSchema>

export const testimonialsHeaderSchema = z.object({
  eyebrow: z.string().trim().min(2, 'Texto de destaque é obrigatório.'),
  heading: z.string().trim().min(3, 'Título é obrigatório.'),
  ratingText: z.string().trim().min(2, 'Texto de avaliação é obrigatório.'),
})

export type TestimonialsHeaderInput = z.infer<typeof testimonialsHeaderSchema>

export const footerContentSchema = z.object({
  copyrightText: z.string().trim().min(3, 'Texto do rodapé é obrigatório.'),
})

export type FooterContentInput = z.infer<typeof footerContentSchema>
