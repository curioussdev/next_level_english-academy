import Link from 'next/link'
import { Play } from 'lucide-react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/format'
import { CourseBuyButton } from '@/components/dashboard/CourseBuyButton'

export default async function StudentCoursesPage() {
  const session = await auth()
  const userId = session!.user.id

  const [enrollments, availableCourses] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId, status: 'ACTIVE' },
      include: {
        course: { include: { modules: { include: { lessons: { select: { id: true } } } } } },
      },
    }),
    prisma.course.findMany({
      where: { isPublished: true, enrollments: { none: { userId } } },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const enrollmentCards = await Promise.all(
    enrollments.map(async (enrollment) => {
      const lessonIds = enrollment.course.modules.flatMap((m) => m.lessons.map((l) => l.id))
      const completedCount = lessonIds.length
        ? await prisma.lessonProgress.count({ where: { userId, lessonId: { in: lessonIds }, isCompleted: true } })
        : 0
      const percentage = lessonIds.length ? Math.round((completedCount / lessonIds.length) * 100) : 0
      return { enrollment, percentage, firstLessonId: lessonIds[0] as string | undefined }
    }),
  )

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-3xl font-bold tracking-tight">Meus cursos</h1>

      {enrollmentCards.length === 0 ? (
        <p className="mt-4 text-slate-500">Ainda não está matriculado em nenhum curso.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrollmentCards.map(({ enrollment, percentage, firstLessonId }) => (
            <div key={enrollment.id} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
                {enrollment.course.level ?? 'Curso'}
              </p>
              <h3 className="mt-2 text-lg font-bold">{enrollment.course.title}</h3>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-violet-500" style={{ width: `${percentage}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                <span>Progresso</span>
                <b className="text-slate-700">{percentage}%</b>
              </div>
              {firstLessonId && (
                <Link
                  href={`/student/lesson/${firstLessonId}`}
                  className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-semibold text-white transition hover:bg-violet-700"
                >
                  <Play size={15} fill="currentColor" /> Continuar
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {availableCourses.length > 0 && (
        <>
          <h2 className="mt-12 text-xl font-bold">Cursos disponíveis</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableCourses.map((course) => (
              <div key={course.id} className="rounded-3xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">{course.level ?? 'Curso'}</p>
                <h3 className="mt-2 text-lg font-bold">{course.title}</h3>
                {course.description && <p className="mt-2 line-clamp-2 text-sm text-slate-500">{course.description}</p>}
                <p className="mt-4 text-2xl font-bold">{formatCurrency(course.price, course.currency)}</p>
                <CourseBuyButton courseId={course.id} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
