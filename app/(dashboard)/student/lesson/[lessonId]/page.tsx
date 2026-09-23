import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { YouTubePlayer } from '@/components/video/YouTubePlayer'

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params
  const session = await auth()
  const userId = session!.user.id

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: true } } },
  })

  if (!lesson) notFound()

  const progress = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  })

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-xs font-bold uppercase tracking-wider text-violet-600">
        {lesson.module.course.title} · {lesson.module.title}
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">{lesson.title}</h1>

      <div className="mt-6">
        <YouTubePlayer lessonId={lesson.id} youtubeVideoId={lesson.youtubeVideoId} startAt={progress?.lastWatchedTimestamp ?? 0} />
      </div>

      {lesson.content && (
        <div className="mt-8 rounded-2xl bg-white p-6 ring-1 ring-slate-100">
          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">{lesson.content}</p>
        </div>
      )}
    </div>
  )
}
