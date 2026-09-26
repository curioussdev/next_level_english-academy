import Link from 'next/link'
import { Plus } from 'lucide-react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/format'
import { DEMO_ADMIN_COURSES, isDemoUser } from '@/lib/demo'
import { safeQuery } from '@/lib/db-safe'

export default async function AdminCoursesPage() {
  const session = await auth()
  const userId = session!.user.id

  const courses = isDemoUser(userId) ? DEMO_ADMIN_COURSES : await safeQuery(loadCourses, [], 'lista de cursos')

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cursos</h1>
          <p className="mt-2 text-muted-foreground">{courses.length} cursos cadastrados.</p>
        </div>
        <Link
          href="/admin/courses/create"
          className="flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:opacity-90"
        >
          <Plus size={16} /> Novo curso
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/admin/courses/${course.id}`}
            className="rounded-3xl border border-border bg-card p-5 transition hover:border-violet-200 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">{course.level ?? 'Curso'}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  course.isPublished ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                }`}
              >
                {course.isPublished ? 'Publicado' : 'Rascunho'}
              </span>
            </div>
            <h3 className="mt-2 text-lg font-bold">{course.title}</h3>
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>{course.moduleCount} módulos</span>
              <span>{course.enrollmentCount} alunos</span>
            </div>
            <p className="mt-3 text-lg font-bold">{formatCurrency(course.price)}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

async function loadCourses() {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { modules: true, enrollments: true } } },
  })

  return courses.map((course) => ({
    id: course.id,
    title: course.title,
    level: course.level,
    price: course.price,
    isPublished: course.isPublished,
    enrollmentCount: course._count.enrollments,
    moduleCount: course._count.modules,
  }))
}
