import { z } from 'zod'

const tagsInput = z
  .string()
  .trim()
  .transform((val) =>
    val
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
  )
  .optional()

const emptyToUndefined = (val: unknown) => (typeof val === 'string' && val.trim() === '' ? undefined : val)

export const leadSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres.'),
  email: z.string().trim().min(1, 'Email é obrigatório.').email('Email inválido.'),
  phone: z.string().trim().optional(),
  source: z.string().trim().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  notes: z.string().trim().optional(),
  tags: tagsInput,
  assignedTo: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  nextFollowUp: z.preprocess(emptyToUndefined, z.coerce.date().optional()),
})

export type LeadInput = z.infer<typeof leadSchema>

export const updateLeadSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres.'),
  email: z.string().trim().min(1, 'Email é obrigatório.').email('Email inválido.'),
  phone: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  source: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  notes: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  tags: tagsInput,
  assignedTo: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  nextFollowUp: z.preprocess(emptyToUndefined, z.coerce.date().optional()),
})

export type UpdateLeadInput = z.infer<typeof updateLeadSchema>
