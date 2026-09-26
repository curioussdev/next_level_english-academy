'use server'

import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import { after } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/resend'
import { passwordResetEmail } from '@/lib/email-templates'
import { getAppUrl } from '@/lib/env'
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from '@/lib/validators/auth'

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000 // 1 hora

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export type ForgotPasswordState = { error: string } | { success: true } | undefined

/**
 * Sempre devolve { success: true } quando o email é válido — nunca revela
 * se a conta existe ou não, para não permitir enumerar contas registadas.
 */
export async function requestPasswordReset(input: ForgotPasswordInput): Promise<ForgotPasswordState> {
  const parsed = forgotPasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Email inválido.' }
  }

  const email = parsed.data.email.toLowerCase()

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (user?.password) {
      const rawToken = crypto.randomBytes(32).toString('hex')
      const tokenHash = hashToken(rawToken)
      const expires = new Date(Date.now() + RESET_TOKEN_TTL_MS)

      // Remove pedidos anteriores deste email antes de criar um novo — só um link válido de cada vez.
      await prisma.verificationToken.deleteMany({ where: { identifier: email } })
      await prisma.verificationToken.create({ data: { identifier: email, token: tokenHash, expires } })

      const resetUrl = `${getAppUrl()}/reset-password/${rawToken}?email=${encodeURIComponent(email)}`
      after(() => sendEmail({ to: email, subject: 'Repor a sua palavra-passe — Next Level', html: passwordResetEmail(resetUrl) }))
    }
  } catch (err) {
    console.warn('[password-reset] falha ao processar pedido:', err)
  }

  return { success: true }
}

export type ResetPasswordState = { error: string } | { success: true } | undefined

export async function resetPassword(
  email: string,
  rawToken: string,
  input: ResetPasswordInput,
): Promise<ResetPasswordState> {
  const parsed = resetPasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Palavra-passe inválida.' }
  }

  const normalizedEmail = email.toLowerCase()
  const tokenHash = hashToken(rawToken)

  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier: normalizedEmail, token: tokenHash } },
  })

  if (!record || record.expires < new Date()) {
    return { error: 'Link inválido ou expirado. Peça um novo.' }
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 10)

  await prisma.$transaction([
    prisma.user.update({ where: { email: normalizedEmail }, data: { password: hashedPassword } }),
    prisma.verificationToken.deleteMany({ where: { identifier: normalizedEmail } }),
  ])

  return { success: true }
}
