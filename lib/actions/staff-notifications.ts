import 'server-only'
import { prisma } from '@/lib/prisma'
import { SUPERADMIN_ROLES } from '@/lib/constants/roles'

/**
 * Notificação in-app para todo o staff de topo (ADMIN/DIRECTOR — mesma
 * autoridade, ver lib/constants/roles.ts) sobre um evento que aconteceu na
 * plataforma (novo aluno, pagamento, lead). "Best effort": nunca lança —
 * uma falha aqui não pode derrubar o registo/pagamento que a chamou.
 */
export async function notifyStaffOfEvent(title: string, message: string, link?: string) {
  try {
    const staff = await prisma.user.findMany({
      where: { role: { in: SUPERADMIN_ROLES } },
      select: { id: true },
    })
    if (staff.length === 0) return

    await prisma.notification.createMany({
      data: staff.map((s) => ({ userId: s.id, title, message, type: 'SYSTEM', link })),
    })
  } catch (err) {
    console.warn('[staff-notifications] falha ao notificar staff:', err)
  }
}
