import { z } from 'zod'

export const leadSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres.'),
  email: z.string().trim().min(1, 'Email é obrigatório.').email('Email inválido.'),
  phone: z.string().trim().optional(),
  source: z.string().trim().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  notes: z.string().trim().optional(),
})

export type LeadInput = z.infer<typeof leadSchema>
