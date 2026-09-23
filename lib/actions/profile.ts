'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isDemoUser } from '@/lib/demo'
import { updateOwnProfileSchema } from '@/lib/validators/user'

/**
 * Auto-edição de perfil — usada tanto pelo aluno como por admin/diretor.
 * Só aceita os campos do updateOwnProfileSchema: nif, email e role nunca
 * chegam a este caminho, mesmo que alguém tente injetá-los no payload.
 */
export async function updateOwnProfile(data: unknown) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Não autorizado.')
  }
  if (isDemoUser(session.user.id)) {
    throw new Error('Modo demo: ligue um banco de dados real para editar o perfil.')
  }

  const parsed = updateOwnProfileSchema.parse(data)

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.name,
      phone: parsed.phone || null,
      bio: parsed.bio || null,
      dateOfBirth: parsed.dateOfBirth ? new Date(parsed.dateOfBirth) : null,
      country: parsed.country || null,
      city: parsed.city || null,
      currentLevel: parsed.currentLevel || null,
      learningGoals: parsed.learningGoals || null,
    },
  })

  revalidatePath('/student/settings')
  revalidatePath('/admin/settings')
}
