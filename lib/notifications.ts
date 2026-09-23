import { prisma } from '@/lib/prisma'
import { DEMO_NOTIFICATIONS, isDemoUser } from '@/lib/demo'

export async function loadNotificationsForUser(userId: string) {
  if (isDemoUser(userId)) return DEMO_NOTIFICATIONS

  try {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 15,
      select: { id: true, title: true, message: true, isRead: true, createdAt: true },
    })
  } catch {
    return []
  }
}
