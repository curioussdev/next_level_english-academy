import { z } from 'zod'

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

export const courseSchema = z.object({
  title: z.string().trim().min(3, 'Título deve ter pelo menos 3 caracteres.'),
  description: z.string().trim().optional(),
  price: z.coerce.number().min(0, 'Preço não pode ser negativo.'),
  level: z.string().trim().optional(),
  category: z.string().trim().optional(),
})

export type CourseInput = z.infer<typeof courseSchema>

export function toSlug(title: string) {
  return slugify(title)
}

export const moduleSchema = z.object({
  title: z.string().trim().min(2, 'Título deve ter pelo menos 2 caracteres.'),
  order: z.coerce.number().int().min(1),
})

export type ModuleInput = z.infer<typeof moduleSchema>

export const lessonSchema = z.object({
  title: z.string().trim().min(2, 'Título deve ter pelo menos 2 caracteres.'),
  youtubeVideoId: z.string().trim().min(1, 'ID do vídeo do YouTube é obrigatório.'),
  duration: z.coerce.number().int().min(0, 'Duração não pode ser negativa.'),
  order: z.coerce.number().int().min(1),
  isFree: z.coerce.boolean().optional(),
})

export type LessonInput = z.infer<typeof lessonSchema>
