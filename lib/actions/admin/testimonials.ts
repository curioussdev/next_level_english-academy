'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireStaffSession, type ActionState } from '@/lib/actions/admin/guard'
import { testimonialSchema } from '@/lib/validators/cms'

export async function createTestimonial(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireStaffSession()
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Não autorizado.' }
  }

  const parsed = testimonialSchema.safeParse({
    authorName: formData.get('authorName'),
    content: formData.get('content'),
    rating: formData.get('rating'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  await prisma.testimonial.create({ data: parsed.data })
  revalidatePath('/admin/content/testimonials')
  revalidatePath('/')
}

export async function toggleTestimonialActive(id: string, isActive: boolean) {
  await requireStaffSession()
  await prisma.testimonial.update({ where: { id }, data: { isActive } })
  revalidatePath('/admin/content/testimonials')
  revalidatePath('/')
}

export async function deleteTestimonial(id: string) {
  await requireStaffSession()
  await prisma.testimonial.delete({ where: { id } })
  revalidatePath('/admin/content/testimonials')
  revalidatePath('/')
}
