import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { YouTubePlayer } from '@/components/video/YouTubePlayer'
import { getDemoLessonDetail, isDemoUser } from '@/lib/demo'

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params
  const session = await auth()
  const userId = session!.user.id

  const lesson = isDemoUser(userId) ? getDemoLessonDetail(lessonId) : await loadLesson(userId, lessonId)

  if (!lesson) notFound()

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-xs font-bold uppercase tracking-wider text-violet-600">
        {lesson.courseTitle} · {lesson.moduleTitle}
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">{lesson.title}</h1>

      <div className="mt-6">
        <YouTubePlayer lessonId={lesson.id} youtubeVideoId={lesson.youtubeVideoId} startAt={lesson.lastWatchedTimestamp} />
      </div>

      {lesson.content && (
        <div className="mt-8 rounded-2xl bg-white p-6 ring-1 ring-slate-100">
          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">{lesson.content}</p>
        </div>
      )}
    </div>
  )
}

async function loadLesson(userId: string, lessonId: string) {
  const [lesson, progress] = await Promise.all([
    prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: true } } },
    }),
    prisma.lessonProgress.findUnique({ where: { userId_lessonId: { userId, lessonId } } }),
  ])
  if (!lesson) return null

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
