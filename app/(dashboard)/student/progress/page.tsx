import { Check } from 'lucide-react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDuration } from '@/lib/format'
import { DEMO_PROGRESS, isDemoUser } from '@/lib/demo'

export default async function StudentProgressPage() {
  const session = await auth()
  const userId = session!.user.id

  const courses = isDemoUser(userId) ? DEMO_PROGRESS : await loadProgress(userId)

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight">O seu progresso</h1>

      {courses.length === 0 ? (
        <p className="mt-4 text-slate-500">Matricule-se num curso para acompanhar o seu progresso aqui.</p>
      ) : (
        <div className="mt-6 space-y-6">
          {courses.map((course) => (
            <div key={course.courseId} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <h2 className="text-lg font-bold">{course.courseTitle}</h2>
              <div className="mt-4 space-y-6">
                {course.modules.map((courseModule) => (
                  <div key={courseModule.id}>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{courseModule.title}</p>
                    <div className="mt-2 space-y-1">
                      {courseModule.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm">
                          <span
                            className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                              lesson.isCompleted ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            {lesson.isCompleted ? <Check size={14} /> : <span className="text-xs">{lesson.order}</span>}
                          </span>
                          <span className="flex-1 text-slate-700">{lesson.title}</span>
                          {lesson.totalTimeWatched > 0 && (
                            <span className="text-xs text-slate-400">{formatDuration(lesson.totalTimeWatched)}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

async function loadProgress(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId, status: 'ACTIVE' },
    include: {
      course: {
        include: {
          modules: {
            orderBy: { order: 'asc' },
            include: { lessons: { orderBy: { order: 'asc' } } },
          },
        },
      },
    },
  })

  const progressRows = await prisma.lessonProgress.findMany({ where: { userId } })
  const progressByLesson = new Map(progressRows.map((p) => [p.lessonId, p]))

  return enrollments.map((enrollment) => ({
    courseId: enrollment.course.id,
    courseTitle: enrollment.course.title,
    modules: enrollment.course.modules.map((courseModule) => ({
      id: courseModule.id,
      title: courseModule.title,
      lessons: courseModule.lessons.map((lesson) => {
        const progress = progressByLesson.get(lesson.id)
        return {
          id: lesson.id,
          title: lesson.title,
          order: lesson.order,
          isCompleted: progress?.isCompleted ?? false,
          totalTimeWatched: progress?.totalTimeWatched ?? 0,
        }
      }),
    })),
  }))
}
