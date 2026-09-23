'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isDemoUser } from '@/lib/demo'

export async function markNotificationRead(notificationId: string) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId || isDemoUser(userId)) return

  await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true, readAt: new Date() },
  })
  revalidatePath('/student')
  revalidatePath('/admin')
}

export async function markAllNotificationsRead() {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId || isDemoUser(userId)) return

  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  })
  revalidatePath('/student')
  revalidatePath('/admin')
}
