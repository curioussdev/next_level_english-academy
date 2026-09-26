'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { after } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireModuleSession, type ActionState } from '@/lib/actions/admin/guard'
import { logActivity } from '@/lib/activity'
import { sendPushToUsers } from '@/lib/push'
import { courseSchema, lessonSchema, moduleSchema, toSlug } from '@/lib/validators/course'

export type { ActionState }

export async function createCourse(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  let session
  try {
    session = await requireModuleSession('courses')
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Não autorizado.' }
  }

  const parsed = courseSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    price: formData.get('price'),
    level: formData.get('level'),
    category: formData.get('category'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const { title, description, price, level, category } = parsed.data
  const baseSlug = toSlug(title) || 'curso'
  let slug = baseSlug
  let attempt = 1
  while (await prisma.course.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${baseSlug}-${++attempt}`
  }

  // A verificação acima (ler depois escrever) não é atómica — duas criações
  // em simultâneo com o mesmo título podem ambas passar o loop antes de
  // qualquer uma gravar. Se isso acontecer, o `create` falha com a violação
  // de unicidade do slug em vez de rebentar com um erro não tratado.
  let course
  try {
    course = await prisma.course.create({ data: { title, slug, description, price, level, category } })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return { error: 'Já foi criado um curso com este título agora mesmo. Tente novamente.' }
    }
    throw err
  }

  await logActivity(session.user.id, 'COURSE_CREATED', { entityType: 'Course', entityId: course.id })

  revalidatePath('/admin/courses')
  redirect(`/admin/courses/${course.id}`)
}

export async function updateCourse(courseId: string, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireModuleSession('courses')
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Não autorizado.' }
  }

  const parsed = courseSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    price: formData.get('price'),
    level: formData.get('level'),
    category: formData.get('category'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  await prisma.course.update({ where: { id: courseId }, data: parsed.data })

  revalidatePath(`/admin/courses/${courseId}`)
  revalidatePath('/admin/courses')
}

export async function toggleCoursePublish(courseId: string, isPublished: boolean) {
  await requireModuleSession('courses')

  if (isPublished) {
    const lessonCount = await prisma.lesson.count({ where: { module: { courseId } } })
    if (lessonCount === 0) {
      throw new Error('Não é possível publicar um curso sem aulas.')
    }
  }

  await prisma.course.update({ where: { id: courseId }, data: { isPublished } })
  revalidatePath(`/admin/courses/${courseId}`)
  revalidatePath('/admin/courses')
}

export async function deleteCourse(courseId: string) {
  await requireModuleSession('courses')

  // Apagar cascata (Enrollment/LessonProgress/Certificate, ver schema) sobre
  // um curso com alunos pagantes é destrutivo demais para um clique — quem
  // quer tirar um curso do ar deve despublicá-lo, não apagá-lo.
  const enrollmentCount = await prisma.enrollment.count({ where: { courseId } })
  if (enrollmentCount > 0) {
    throw new Error(`Não é possível apagar: ${enrollmentCount} aluno(s) matriculado(s) neste curso. Despublique-o em vez de apagar.`)
  }

  await prisma.course.delete({ where: { id: courseId } })
  revalidatePath('/admin/courses')
  redirect('/admin/courses')
}

export async function createModule(courseId: string, formData: FormData) {
  await requireModuleSession('courses')

  const parsed = moduleSchema.safeParse({ title: formData.get('title'), order: formData.get('order') })
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Dados do módulo inválidos.')
  }

  await prisma.module.create({ data: { courseId, ...parsed.data } })
  revalidatePath(`/admin/courses/${courseId}`)
}

export async function deleteModule(courseId: string, moduleId: string) {
  await requireModuleSession('courses')
  await prisma.module.delete({ where: { id: moduleId } })
  revalidatePath(`/admin/courses/${courseId}`)
}

export async function createLesson(courseId: string, moduleId: string, formData: FormData) {
  await requireModuleSession('courses')

  const parsed = lessonSchema.safeParse({
    title: formData.get('title'),
    youtubeVideoId: formData.get('youtubeVideoId'),
    duration: formData.get('duration'),
    order: formData.get('order'),
    isFree: formData.get('isFree') === 'on',
  })
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Dados da aula inválidos.')
  }

  const lesson = await prisma.lesson.create({ data: { moduleId, ...parsed.data } })
  after(() => notifyEnrolledStudents(courseId, lesson.title))

  revalidatePath(`/admin/courses/${courseId}`)
}

export async function deleteLesson(courseId: string, lessonId: string) {
  await requireModuleSession('courses')
  await prisma.lesson.delete({ where: { id: lessonId } })
  revalidatePath(`/admin/courses/${courseId}`)
}

async function notifyEnrolledStudents(courseId: string, lessonTitle: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId, status: 'ACTIVE' },
    select: { userId: true },
  })
  if (enrollments.length === 0) return

  const message = `"${lessonTitle}" já está disponível.`

  await Promise.all([
    prisma.notification.createMany({
      data: enrollments.map((e) => ({ userId: e.userId, title: 'Nova aula disponível', message, type: 'COURSE' })),
    }),
    sendPushToUsers(
      enrollments.map((e) => e.userId),
      { title: 'Nova aula disponível', body: message, url: '/student/courses' },
    ),
  ])
}
