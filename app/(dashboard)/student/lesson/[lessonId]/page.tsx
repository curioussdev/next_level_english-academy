import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { YouTubePlayer } from '@/components/video/YouTubePlayer'
import { getDemoLessonDetail, isDemoUser } from '@/lib/demo'
import { safeQuery } from '@/lib/db-safe'

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params
  const session = await auth()
  const userId = session!.user.id

  const lesson = isDemoUser(userId)
    ? getDemoLessonDetail(lessonId)
    : await safeQuery(() => loadLesson(userId, lessonId), null, 'aula')

  if (!lesson) notFound()

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-xs font-bold uppercase tracking-wider text-primary">
        {lesson.courseTitle} · {lesson.moduleTitle}
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">{lesson.title}</h1>

      <div className="mt-6">
        <YouTubePlayer lessonId={lesson.id} youtubeVideoId={lesson.youtubeVideoId} startAt={lesson.lastWatchedTimestamp} />
      </div>

      {lesson.content && (
        <div className="mt-8 rounded-2xl bg-card p-6 ring-1 ring-border">
          <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{lesson.content}</p>
        </div>
      )}
    </div>
  )
}

async function loadLesson(userId: string, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: true } } },
  })
  if (!lesson || !lesson.isPublished) return null

  // Aulas grátis (amostra) não exigem matrícula; todas as outras exigem uma
  // Enrollment ACTIVE no curso — sem isto, qualquer aluno autenticado
  // conseguia ver o conteúdo completo de qualquer aula só pelo URL.
  if (!lesson.isFree) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: lesson.module.course.id } },
      select: { status: true },
    })
    if (enrollment?.status !== 'ACTIVE') return null
  }

  const progress = await prisma.lessonProgress.findUnique({ where: { userId_lessonId: { userId, lessonId } } })

  return {
    id: lesson.id,
    title: lesson.title,
    courseTitle: lesson.module.course.title,
    moduleTitle: lesson.module.title,
    youtubeVideoId: lesson.youtubeVideoId,
    content: lesson.content,
    lastWatchedTimestamp: progress?.lastWatchedTimestamp ?? 0,
  }
}
