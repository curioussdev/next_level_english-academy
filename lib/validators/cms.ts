import { z } from 'zod'

export const testimonialSchema = z.object({
  authorName: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres.'),
  content: z.string().trim().min(10, 'Depoimento deve ter pelo menos 10 caracteres.'),
  rating: z.coerce.number().int().min(1).max(5),
})

export type TestimonialInput = z.infer<typeof testimonialSchema>

export const heroContentSchema = z.object({
  title: z.string().trim().min(3, 'Título é obrigatório.'),
  subtitle: z.string().trim().min(3, 'Subtítulo é obrigatório.'),
})

export type HeroContentInput = z.infer<typeof heroContentSchema>
