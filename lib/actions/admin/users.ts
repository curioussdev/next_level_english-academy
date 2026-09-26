'use server'

import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import { after } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession, requireModuleSession } from '@/lib/actions/admin/guard'
import { logActivity } from '@/lib/activity'
import { canManageUser, SUPERADMIN_ROLES, type AppRole, type TenantModule } from '@/lib/constants/roles'
import { createStaffSchema, createStudentSchema, updatePermissionsSchema, updateStudentAdminSchema } from '@/lib/validators/user'
import { sendEmail } from '@/lib/resend'
import { accountCreatedByStaffEmail } from '@/lib/email-templates'

export async function setUserBlocked(userId: string, isBlocked: boolean, reason?: string) {
  const session = await requireModuleSession('students')

  if (session.user.id === userId) {
    throw new Error('Não pode bloquear a própria conta.')
  }

  const target = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { role: true } })
  if (!canManageUser(session.user.role, target.role)) {
    throw new Error('Não tem permissão para gerir esta conta.')
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      isBlocked,
      blockedAt: isBlocked ? new Date() : null,
      blockedReason: isBlocked ? (reason ?? 'Bloqueado pelo admin') : null,
    },
  })

  await logActivity(session.user.id, isBlocked ? 'USER_BLOCKED' : 'USER_UNBLOCKED', { entityType: 'User', entityId: userId })

  revalidatePath('/admin/students')
  revalidatePath(`/admin/students/${userId}`)
}

export async function setUserRole(userId: string, role: AppRole) {
  const session = await requireModuleSession('students')

  if (session.user.id === userId) {
    throw new Error('Não pode alterar o próprio papel.')
  }

  const target = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { role: true } })
  if (!canManageUser(session.user.role, target.role)) {
    throw new Error('Não tem permissão para gerir esta conta.')
  }

  // Um TENANT_ADMIN só gere STUDENT (ver lib/constants/roles.ts) — isto
  // inclui nunca poder promover ninguém a nenhum papel de staff, não só
  // ADMIN/DIRECTOR. Sem este bloqueio geral, um sub-admin com o módulo
  // "students" conseguiria criar novos INSTRUCTOR/TENANT_ADMIN à vontade.
  if (role !== 'STUDENT' && !SUPERADMIN_ROLES.includes(session.user.role)) {
    throw new Error('Apenas um Admin ou Director pode atribuir esse papel.')
  }

  await prisma.user.update({ where: { id: userId }, data: { role, ...(role !== 'TENANT_ADMIN' ? { permissions: [] } : {}) } })

  revalidatePath('/admin/students')
  revalidatePath(`/admin/students/${userId}`)
}

/** Gera uma senha temporária legível (evita caracteres ambíguos: 0/O, 1/l/I). */
function generateTempPassword(length = 12): string {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  return Array.from({ length }, () => charset[crypto.randomInt(charset.length)]).join('')
}

/** Exportado para reutilização fora deste ficheiro — ex.: conversão de lead do CRM em conta de aluno. */
export async function createUserWithTempPassword(data: { name: string; email: string; role: AppRole; permissions?: string[] }) {
  const existing = await prisma.user.findUnique({ where: { email: data.email }, select: { id: true } })
  if (existing) {
    throw new Error('Já existe uma conta com este email.')
  }

  const tempPassword = generateTempPassword()
  const hashedPassword = await bcrypt.hash(tempPassword, 10)

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      permissions: data.role === 'TENANT_ADMIN' ? (data.permissions ?? []) : [],
    },
    select: { id: true },
  })

  // Alinhado com o auto-registo (lib/actions/auth.ts): a nova conta também
  // recebe as credenciais por email, não só o ecrã do staff que a criou —
  // antes disto, se o staff esquecesse de copiar a senha, não havia
  // segunda via para a entregar.
  after(() => sendEmail({ to: data.email, subject: 'A sua conta na Next Level', html: accountCreatedByStaffEmail(data.name, data.email, tempPassword) }))

  return { userId: user.id, tempPassword }
}

/** Diretor/Admin/TENANT_ADMIN-com-permissão 'students' cria uma conta de aluno com senha temporária. */
export async function createStudent(data: unknown) {
  const session = await requireModuleSession('students')
  const parsed = createStudentSchema.parse(data)

  const result = await createUserWithTempPassword({ ...parsed, role: 'STUDENT' })
  await logActivity(session.user.id, 'USER_CREATED', { entityType: 'User', entityId: result.userId, metadata: { role: 'STUDENT' } })

  revalidatePath('/admin/students')
  return result
}

/** Só superadmin (ADMIN/DIRECTOR) cria contas de staff (TENANT_ADMIN, ADMIN, DIRECTOR, INSTRUCTOR). */
export async function createStaffUser(data: unknown) {
  const session = await requireAdminSession()
  const parsed = createStaffSchema.parse(data)

  const result = await createUserWithTempPassword(parsed)
  await logActivity(session.user.id, 'USER_CREATED', { entityType: 'User', entityId: result.userId, metadata: { role: parsed.role } })

  revalidatePath('/admin/students')
  revalidatePath('/admin/sub-admins')
  return result
}

/** Só superadmin ajusta os módulos que um TENANT_ADMIN pode aceder. */
export async function updateUserPermissions(userId: string, permissions: TenantModule[]) {
  const session = await requireAdminSession()

  // `permissions` chega tipado como TenantModule[] só a nível de TypeScript
  // — esta é uma Server Action, um endpoint público chamável diretamente,
  // por isso o tipo não protege nada em runtime sem isto.
  const parsed = updatePermissionsSchema.parse({ permissions })

  const target = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { role: true } })
  if (target.role !== 'TENANT_ADMIN') {
    throw new Error('Permissões por módulo só se aplicam a contas Sub-admin.')
  }

  await prisma.user.update({ where: { id: userId }, data: { permissions: parsed.permissions } })
  await logActivity(session.user.id, 'PERMISSIONS_UPDATED', { entityType: 'User', entityId: userId, metadata: { permissions: parsed.permissions } })

  revalidatePath('/admin/sub-admins')
}

/** Edição completa do perfil de um aluno pelo staff — o único caminho que pode alterar o nif. */
export async function updateStudentProfile(userId: string, data: unknown) {
  const session = await requireModuleSession('students')
  const parsed = updateStudentAdminSchema.parse(data)

  const target = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { role: true } })
  if (!canManageUser(session.user.role, target.role)) {
    throw new Error('Não tem permissão para gerir esta conta.')
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: parsed.name,
      phone: parsed.phone || null,
      bio: parsed.bio || null,
      dateOfBirth: parsed.dateOfBirth ? new Date(parsed.dateOfBirth) : null,
      country: parsed.country || null,
      city: parsed.city || null,
      currentLevel: parsed.currentLevel || null,
      learningGoals: parsed.learningGoals || null,
      ...(parsed.nif ? { nif: parsed.nif } : {}),
    },
  })

  revalidatePath('/admin/students')
  revalidatePath(`/admin/students/${userId}`)
}
