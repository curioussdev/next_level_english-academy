'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { LeadStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireModuleSession, type ActionState } from '@/lib/actions/admin/guard'
import { leadSchema, updateLeadSchema } from '@/lib/validators/crm'
import { logActivity } from '@/lib/activity'
import { auth } from '@/lib/auth'
import { isDemoUser } from '@/lib/demo'
import { hasModuleAccess, STAFF_ROLES } from '@/lib/constants/roles'
import { LEAD_STATUS_LABELS } from '@/lib/constants/crm'
import { createUserWithTempPassword } from '@/lib/actions/admin/users'

export async function createLead(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireModuleSession('crm')
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
    tags: formData.get('tags'),
    assignedTo: formData.get('assignedTo'),
    nextFollowUp: formData.get('nextFollowUp'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const duplicate = await prisma.cRMLead.findFirst({ where: { email: parsed.data.email }, select: { name: true, status: true } })
  if (duplicate) {
    return { error: `Já existe um lead com este email: ${duplicate.name} (fase: ${LEAD_STATUS_LABELS[duplicate.status]}).` }
  }

  await prisma.cRMLead.create({ data: parsed.data })
  revalidatePath('/admin/crm')
  redirect('/admin/crm')
}

export async function updateLead(leadId: string, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireModuleSession('crm')
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Não autorizado.' }
  }

  const parsed = updateLeadSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    source: formData.get('source'),
    priority: formData.get('priority'),
    notes: formData.get('notes'),
    tags: formData.get('tags'),
    assignedTo: formData.get('assignedTo'),
    nextFollowUp: formData.get('nextFollowUp'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  await prisma.cRMLead.update({ where: { id: leadId }, data: parsed.data })
  revalidatePath('/admin/crm')
}

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  const session = await requireModuleSession('crm')
  const lead = await prisma.cRMLead.findUniqueOrThrow({
    where: { id: leadId },
    select: { status: true, userId: true, name: true, email: true },
  })

  await prisma.cRMLead.update({
    where: { id: leadId },
    data: {
      status,
      lastContactDate: new Date(),
      convertedAt: status === 'ENROLLED' ? new Date() : undefined,
    },
  })

  if (status !== lead.status) {
    await logActivity(session.user.id, 'LEAD_STATUS_CHANGED', {
      entityType: 'CRMLead',
      entityId: leadId,
      metadata: { from: lead.status, to: status, leadName: lead.name },
    })
  }

  if (status === 'ENROLLED' && !lead.userId) {
    try {
      await convertLeadToStudent(leadId)
    } catch (err) {
      console.warn('[crm] não foi possível converter o lead automaticamente:', err)
    }
  }

  revalidatePath('/admin/crm')
}

/** Cria (ou associa a) uma conta de aluno a partir de um lead. Chamado automaticamente ao mover para "Matriculado", e também disponível manualmente no painel de detalhe. */
export async function convertLeadToStudent(leadId: string) {
  const session = await requireModuleSession('crm')
  const lead = await prisma.cRMLead.findUniqueOrThrow({ where: { id: leadId } })

  if (lead.userId) {
    throw new Error('Este lead já está associado a uma conta de aluno.')
  }

  const existingUser = await prisma.user.findUnique({ where: { email: lead.email }, select: { id: true } })

  let userId: string
  let existingAccount: boolean
  if (existingUser) {
    userId = existingUser.id
    existingAccount = true
  } else {
    const result = await createUserWithTempPassword({ name: lead.name, email: lead.email, role: 'STUDENT' })
    userId = result.userId
    existingAccount = false
  }

  await prisma.cRMLead.update({ where: { id: leadId }, data: { userId, convertedAt: lead.convertedAt ?? new Date() } })
  await logActivity(session.user.id, 'LEAD_CONVERTED', {
    entityType: 'CRMLead',
    entityId: leadId,
    metadata: { userId, existingAccount, leadName: lead.name },
  })

  revalidatePath('/admin/crm')
  revalidatePath('/admin/students')
  return { userId, existingAccount }
}

export async function addLeadActivity(leadId: string, content: string) {
  const session = await requireModuleSession('crm')
  const trimmed = content.trim()
  if (trimmed.length < 2) {
    throw new Error('A nota precisa de pelo menos 2 caracteres.')
  }

  await logActivity(session.user.id, 'LEAD_NOTE_ADDED', {
    entityType: 'CRMLead',
    entityId: leadId,
    metadata: { content: trimmed },
  })

  revalidatePath('/admin/crm')
}

/** Leitura do histórico — não bloqueia sessões demo com erro (o painel abre-se automaticamente ao clicar num lead), só devolve vazio. */
export async function getLeadActivities(leadId: string) {
  const session = await auth()
  if (!session?.user?.role || !STAFF_ROLES.includes(session.user.role)) return []
  if (isDemoUser(session.user.id)) return []
  if (!hasModuleAccess(session.user, 'crm')) return []

  const logs = await prisma.activityLog.findMany({
    where: { entityType: 'CRMLead', entityId: leadId },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, email: true } } },
  })

  return logs.map((log) => ({
    id: log.id,
    action: log.action,
    metadata: log.metadata as Record<string, unknown> | null,
    createdAt: log.createdAt,
    authorName: log.user.name ?? log.user.email,
  }))
}

export async function deleteLead(leadId: string) {
  await requireModuleSession('crm')
  await prisma.cRMLead.delete({ where: { id: leadId } })
  revalidatePath('/admin/crm')
}

export async function bulkUpdateLeadStatus(leadIds: string[], status: LeadStatus) {
  const session = await requireModuleSession('crm')
  if (leadIds.length === 0) return

  const leads = await prisma.cRMLead.findMany({
    where: { id: { in: leadIds } },
    select: { id: true, status: true, userId: true },
  })

  await prisma.cRMLead.updateMany({
    where: { id: { in: leadIds } },
    data: { status, lastContactDate: new Date(), convertedAt: status === 'ENROLLED' ? new Date() : undefined },
  })

  await Promise.all(
    leads.map(async (lead) => {
      if (lead.status !== status) {
        await logActivity(session.user.id, 'LEAD_STATUS_CHANGED', {
          entityType: 'CRMLead',
          entityId: lead.id,
          metadata: { from: lead.status, to: status, bulk: true },
        })
      }
      if (status === 'ENROLLED' && !lead.userId) {
        try {
          await convertLeadToStudent(lead.id)
        } catch (err) {
          console.warn('[crm] não foi possível converter o lead automaticamente (lote):', err)
        }
      }
    }),
  )

  revalidatePath('/admin/crm')
}

export async function bulkAssignLeads(leadIds: string[], assignedTo: string | null) {
  await requireModuleSession('crm')
  if (leadIds.length === 0) return
  await prisma.cRMLead.updateMany({ where: { id: { in: leadIds } }, data: { assignedTo } })
  revalidatePath('/admin/crm')
}

export async function bulkAddTag(leadIds: string[], tag: string) {
  await requireModuleSession('crm')
  const trimmed = tag.trim()
  if (!trimmed || leadIds.length === 0) return

  const leads = await prisma.cRMLead.findMany({ where: { id: { in: leadIds } }, select: { id: true, tags: true } })
  const toUpdate = leads.filter((l) => !l.tags.includes(trimmed))
  if (toUpdate.length === 0) return

  await prisma.$transaction(toUpdate.map((l) => prisma.cRMLead.update({ where: { id: l.id }, data: { tags: { push: trimmed } } })))
  revalidatePath('/admin/crm')
}

export async function bulkDeleteLeads(leadIds: string[]) {
  await requireModuleSession('crm')
  if (leadIds.length === 0) return
  await prisma.cRMLead.deleteMany({ where: { id: { in: leadIds } } })
  revalidatePath('/admin/crm')
}
