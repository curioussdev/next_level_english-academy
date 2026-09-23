'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/actions/admin/guard'
import { logActivity } from '@/lib/activity'
import { canManageUser, type AppRole } from '@/lib/constants/roles'

export async function setUserBlocked(userId: string, isBlocked: boolean, reason?: string) {
  const session = await requireAdminSession()

  if (session.user.id === userId) {
    throw new Error('Não pode bloquear a própria conta.')
  }

  const target = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { role: true } })
  if (!canManageUser(session.user.role, target.role)) {
    throw new Error('Não tem permissão para gerir esta conta.')
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      isBlocked,
      blockedAt: isBlocked ? new Date() : null,
      blockedReason: isBlocked ? (reason ?? 'Bloqueado pelo admin') : null,
    },
  })

  await logActivity(session.user.id, isBlocked ? 'USER_BLOCKED' : 'USER_UNBLOCKED', { entityType: 'User', entityId: userId })

  revalidatePath('/admin/students')
  revalidatePath(`/admin/students/${userId}`)
}

export async function setUserRole(userId: string, role: AppRole) {
  const session = await requireAdminSession()

  if (session.user.id === userId) {
    throw new Error('Não pode alterar o próprio papel.')
  }

  const target = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { role: true } })
  if (!canManageUser(session.user.role, target.role)) {
    throw new Error('Não tem permissão para gerir esta conta.')
  }

  // Só DIRECTOR pode promover outra pessoa a DIRECTOR.
  if (role === 'DIRECTOR' && session.user.role !== 'DIRECTOR') {
    throw new Error('Apenas um Director pode promover outra pessoa a Director.')
  }

  await prisma.user.update({ where: { id: userId }, data: { role } })

  revalidatePath('/admin/students')
  revalidatePath(`/admin/students/${userId}`)
}
