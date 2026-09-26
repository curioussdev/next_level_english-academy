'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isDemoUser } from '@/lib/demo'

/** Teto de segundos que um único heartbeat pode reportar — mesmo tempo-limite usado em hooks/useVideoProgress.ts, para nunca confiar num valor inflacionado (tab em segundo plano, cliente adulterado). */
const MAX_WATCHED_SECONDS_PER_HEARTBEAT = 13

/** Fração da aula assistida a partir da qual o servidor aceita "concluída" — nunca confiar só no booleano vindo do cliente. */
const COMPLETION_THRESHOLD = 0.9

export async function updateProgress(
  lessonId: string,
  currentTime: number,
  durationSeconds: number,
  isCompleted = false,
  watchedSeconds = 10,
) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    throw new Error('Não autenticado.')
  }

  // Sessão demo (sem banco conectado) — nada a persistir.
  if (isDemoUser(userId)) return

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { isFree: true, isPublished: true, duration: true, module: { select: { courseId: true } } },
  })
  if (!lesson || !lesson.isPublished) {
    throw new Error('Aula não encontrada.')
  }
  if (!lesson.isFree) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: lesson.module.courseId } },
      select: { status: true },
    })
    if (enrollment?.status !== 'ACTIVE') {
      throw new Error('Não tem acesso a esta aula.')
    }
  }

  // Nunca confiar em valores negativos do cliente, e usar a duração real
  // guardada na aula (não a que o cliente reportar) sempre que existir.
  const safeCurrentTime = Math.max(0, currentTime)
  const safeDuration = lesson.duration > 0 ? lesson.duration : Math.max(0, durationSeconds)
  const completionPercentage = safeDuration > 0 ? Math.max(0, Math.min(100, Math.round((safeCurrentTime / safeDuration) * 100))) : 0
  const serverIsCompleted = isCompleted && completionPercentage >= COMPLETION_THRESHOLD * 100

  const existing = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
    select: { isCompleted: true, completionPercentage: true },
  })
  const justCompleted = serverIsCompleted && !existing?.isCompleted
  // Marca d'água: nunca deixar a percentagem descer (ex.: aluno rebobina do início depois de já ter avançado).
  const bestPercentage = Math.max(completionPercentage, existing?.completionPercentage ?? 0)
  // O cliente reporta quanto tempo passou de facto desde o heartbeat
  // anterior (não um valor fixo) — ver hooks/useVideoProgress.ts. Clampado
  // aqui outra vez porque nunca se confia num número vindo do cliente.
  const safeWatchedSeconds = Math.min(Math.max(0, Math.round(watchedSeconds)), MAX_WATCHED_SECONDS_PER_HEARTBEAT)

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: {
      lastWatchedTimestamp: safeCurrentTime,
      completionPercentage: bestPercentage,
      totalTimeWatched: { increment: safeWatchedSeconds },
      ...(serverIsCompleted ? { isCompleted: true } : {}),
      ...(justCompleted ? { watchCount: { increment: 1 } } : {}),
    },
    create: {
      userId,
      lessonId,
      lastWatchedTimestamp: safeCurrentTime,
      completionPercentage: bestPercentage,
      totalTimeWatched: safeWatchedSeconds,
      isCompleted: serverIsCompleted,
      watchCount: serverIsCompleted ? 1 : 0,
    },
  })
}
