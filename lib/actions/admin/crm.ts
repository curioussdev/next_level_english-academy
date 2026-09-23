'use server'

import { revalidatePath } from 'next/cache'
import type { LeadStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireStaffSession, type ActionState } from '@/lib/actions/admin/guard'
import { leadSchema } from '@/lib/validators/crm'

export async function createLead(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireStaffSession()
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Não autorizado.' }
  }

  const parsed = leadSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    source: formData.get('source'),
    priority: formData.get('priority'),
    notes: formData.get('notes'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  await prisma.cRMLead.create({ data: parsed.data })
  revalidatePath('/admin/crm')
}

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  await requireStaffSession()
  await prisma.cRMLead.update({
    where: { id: leadId },
    data: {
      status,
      lastContactDate: new Date(),
      convertedAt: status === 'ENROLLED' ? new Date() : undefined,
    },
  })
  revalidatePath('/admin/crm')
}

export async function deleteLead(leadId: string) {
  await requireStaffSession()
  await prisma.cRMLead.delete({ where: { id: leadId } })
  revalidatePath('/admin/crm')
}
