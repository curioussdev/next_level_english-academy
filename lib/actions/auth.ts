'use server'

import bcrypt from 'bcryptjs'
import { Prisma } from '@prisma/client'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { registerSchema, type RegisterInput } from '@/lib/validators/auth'
import { sendEmail, CONTACT_EMAIL } from '@/lib/resend'
import { welcomeEmail, newRegistrationNotificationEmail } from '@/lib/email-templates'

export type RegisterState = { error: string } | undefined

export async function registerUser(input: RegisterInput): Promise<RegisterState> {
  const parsed = registerSchema.safeParse(input)

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const { name, password } = parsed.data
  const email = parsed.data.email.toLowerCase()

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { error: 'Já existe uma conta com este email.' }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: 'STUDENT' },
    })
    await prisma.notification
      .create({
        data: {
          userId: user.id,
          title: 'Bem-vindo à Next Level!',
          message: 'A sua conta foi criada com sucesso. Explore o catálogo e comece a aprender hoje.',
          type: 'SYSTEM',
        },
      })
      .catch(() => {})

    await sendEmail({ to: email, subject: 'Bem-vindo à Next Level!', html: welcomeEmail(name) })
    if (CONTACT_EMAIL) {
      await sendEmail({
        to: CONTACT_EMAIL,
        subject: 'Novo aluno registado — Next Level',
        html: newRegistrationNotificationEmail(name, email),
      })
    }
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return { error: 'Já existe uma conta com este email.' }
    }
    throw err
  }

  redirect('/login?registered=true')
}
