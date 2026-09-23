'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isDemoUser } from '@/lib/demo'

const HEARTBEAT_SECONDS = 10

export async function updateProgress(
  lessonId: string,
  currentTime: number,
  durationSeconds: number,
  isCompleted = false,
) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    throw new Error('Não autenticado.')
  }

  // Sessão demo (sem banco conectado) — nada a persistir.
  if (isDemoUser(userId)) return

  const completionPercentage =
    durationSeconds > 0 ? Math.min(100, Math.round((currentTime / durationSeconds) * 100)) : 0

  const existing = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
    select: { isCompleted: true },
  })
  const justCompleted = isCompleted && !existing?.isCompleted

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: {
      lastWatchedTimestamp: currentTime,
      completionPercentage,
      totalTimeWatched: { increment: HEARTBEAT_SECONDS },
      ...(isCompleted ? { isCompleted: true } : {}),
      ...(justCompleted ? { watchCount: { increment: 1 } } : {}),
    },
    create: {
      userId,
      lessonId,
      lastWatchedTimestamp: currentTime,
      completionPercentage,
      totalTimeWatched: HEARTBEAT_SECONDS,
      isCompleted,
      watchCount: isCompleted ? 1 : 0,
    },
  })
}
