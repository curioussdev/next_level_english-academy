import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email é obrigatório.').email('Email inválido.'),
  password: z.string().min(1, 'Palavra-passe é obrigatória.'),
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres.'),
  email: z.string().trim().min(1, 'Email é obrigatório.').email('Email inválido.'),
  password: z.string().min(8, 'A palavra-passe deve ter pelo menos 8 caracteres.'),
})

export type RegisterInput = z.infer<typeof registerSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, 'Email é obrigatório.').email('Email inválido.'),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'A palavra-passe deve ter pelo menos 8 caracteres.'),
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
