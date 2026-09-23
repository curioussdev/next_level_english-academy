'use server'

import bcrypt from 'bcryptjs'
import { Prisma } from '@prisma/client'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { registerSchema, type RegisterInput } from '@/lib/validators/auth'

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
    await prisma.user.create({
      data: { name, email, password: hashedPassword, role: 'STUDENT' },
    })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return { error: 'Já existe uma conta com este email.' }
    }
    throw err
  }

  redirect('/login?registered=true')
}
