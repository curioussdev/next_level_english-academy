'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireStaffSession, type ActionState } from '@/lib/actions/admin/guard'
import { heroContentSchema } from '@/lib/validators/cms'

export async function saveHeroContent(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireStaffSession()
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Não autorizado.' }
  }

  const parsed = heroContentSchema.safeParse({
    title: formData.get('title'),
    subtitle: formData.get('subtitle'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const existing = await prisma.cMSContent.findFirst({ where: { page: 'landing', contentType: 'HERO' } })

  if (existing) {
    await prisma.cMSContent.update({
      where: { id: existing.id },
      data: { title: parsed.data.title, subtitle: parsed.data.subtitle },
    })
  } else {
    await prisma.cMSContent.create({
      data: { page: 'landing', contentType: 'HERO', title: parsed.data.title, subtitle: parsed.data.subtitle },
    })
  }

  revalidatePath('/admin/content/landing-page')
  revalidatePath('/')
}
