import { z } from 'zod'
import { TENANT_MODULES } from '@/lib/constants/roles'

/** Dígito de controlo do NIF português (algoritmo mod 11 padrão). */
export function isValidNif(nif: string): boolean {
  if (!/^\d{9}$/.test(nif)) return false
  const digits = nif.split('').map(Number)
  const sum = digits.slice(0, 8).reduce((acc, digit, index) => acc + digit * (9 - index), 0)
  const remainder = sum % 11
  const checkDigit = remainder < 2 ? 0 : 11 - remainder
  return checkDigit === digits[8]
}

export const nifSchema = z
  .string()
  .trim()
  .regex(/^\d{9}$/, 'NIF deve ter 9 dígitos.')
  .refine(isValidNif, 'NIF inválido.')

const profileFieldsSchema = {
  name: z.string().trim().min(1, 'Nome é obrigatório.'),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  bio: z.string().trim().max(2000).optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
  country: z.string().trim().max(100).optional().or(z.literal('')),
  city: z.string().trim().max(100).optional().or(z.literal('')),
  currentLevel: z.string().trim().max(50).optional().or(z.literal('')),
  learningGoals: z.string().trim().max(2000).optional().or(z.literal('')),
}

/** Auto-edição de perfil (aluno, admin, diretor) — nunca aceita nif/email/role. */
export const updateOwnProfileSchema = z.object(profileFieldsSchema)
export type UpdateOwnProfileInput = z.infer<typeof updateOwnProfileSchema>

/** Edição de um aluno pelo staff — inclui o nif (só staff pode corrigir). */
export const updateStudentAdminSchema = z.object({
  ...profileFieldsSchema,
  nif: nifSchema.optional().or(z.literal('')),
})
export type UpdateStudentAdminInput = z.infer<typeof updateStudentAdminSchema>

export const createStudentSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório.'),
  email: z.string().trim().min(1, 'Email é obrigatório.').email('Email inválido.'),
})
export type CreateStudentInput = z.infer<typeof createStudentSchema>

export const createStaffSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório.'),
  email: z.string().trim().min(1, 'Email é obrigatório.').email('Email inválido.'),
  role: z.enum(['TENANT_ADMIN', 'ADMIN', 'DIRECTOR', 'INSTRUCTOR']),
  permissions: z.array(z.enum(TENANT_MODULES)).optional(),
})
export type CreateStaffInput = z.infer<typeof createStaffSchema>

export const updatePermissionsSchema = z.object({
  permissions: z.array(z.enum(TENANT_MODULES)),
})
