import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CourseEditForm } from '@/components/admin/CourseEditForm'
import { CourseModulesManager } from '@/components/admin/CourseModulesManager'
import { DeleteCourseButton, PublishToggle } from '@/components/admin/CourseActions'
import { getDemoCourseDetail, isDemoUser } from '@/lib/demo'

export default async function AdminCourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
  const session = await auth()

  const course = isDemoUser(session!.user.id) ? getDemoCourseDetail(courseId) : await loadCourse(courseId)

  if (!course) notFound()

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/courses" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900">
        <ArrowLeft size={16} /> Cursos
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
        <div className="flex gap-2">
          <PublishToggle courseId={course.id} isPublished={course.isPublished} />
          <DeleteCourseButton courseId={course.id} />
        </div>
      </div>

      <div className="mt-6">
        <CourseEditForm
          courseId={course.id}
          title={course.title}
          description={course.description}
          price={course.price}
          level={course.level}
          category={course.category}
        />
      </div>

      <h2 className="mt-10 text-xl font-bold">Conteúdo do curso</h2>
      <div className="mt-4">
        <CourseModulesManager courseId={course.id} modules={course.modules} />
      </div>
    </div>
  )
}

async function loadCourse(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: { lessons: { orderBy: { order: 'asc' } } },
      },
    },
  })
  if (!course) return null

  return {
    id: course.id,
    title: course.title,
    description: course.description,
    price: course.price,
    level: course.level,
    category: course.category,
    isPublished: course.isPublished,
    modules: course.modules.map((courseModule) => ({
      id: courseModule.id,
      title: courseModule.title,
      order: courseModule.order,
      lessons: courseModule.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        duration: lesson.duration,
        order: lesson.order,
        isFree: lesson.isFree,
      })),
    })),
  }
}
