import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { isDemoUser } from '@/lib/demo'

/**
 * Log de auditoria "best effort": nunca deve derrubar a ação principal que o
 * chamou. Se o banco estiver indisponível (ou for uma sessão demo), falha em
 * silêncio — só regista o console para não perder o rasto em dev.
 */
export async function logActivity(
  userId: string,
  action: string,
  opts?: { entityType?: string; entityId?: string; metadata?: Record<string, unknown> },
) {
  if (isDemoUser(userId)) return

  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entityType: opts?.entityType,
        entityId: opts?.entityId,
        metadata: opts?.metadata as Prisma.InputJsonValue | undefined,
      },
    })
  } catch (err) {
    console.warn('[activity] falha ao registar log:', err)
  }
}
