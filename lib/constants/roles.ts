import type { Role } from '@prisma/client'

// Reexportado como tipo — nunca duplique esta união à mão em outro arquivo
// (a Fase 1 já causou um bug de tipos por causa de uma cópia desatualizada).
export type AppRole = Role

/**
 * ADMIN e DIRECTOR têm exatamente a mesma autoridade — acesso total ao
 * sistema. Mantidos como dois valores de enum distintos por razão de
 * identidade/rótulo (Director = Ralde Sicato, CEO), não de permissão.
 */
export const SUPERADMIN_ROLES: AppRole[] = ['ADMIN', 'DIRECTOR']

export const ADMIN_ROLES: AppRole[] = SUPERADMIN_ROLES
export const STAFF_ROLES: AppRole[] = ['INSTRUCTOR', 'ADMIN', 'DIRECTOR', 'TENANT_ADMIN']

/**
 * Módulos administrativos que um TENANT_ADMIN pode receber por permissão
 * individual (checkboxes atribuídas pelo Diretor/Admin). Superadmins têm
 * acesso total a todos, sempre.
 */
export const TENANT_MODULES = ['students', 'courses', 'crm', 'sales', 'content'] as const
export type TenantModule = (typeof TENANT_MODULES)[number]

/** Prefixo de rota /admin/* de cada módulo — usado pelo middleware e pela nav do DashboardShell. */
export const MODULE_ROUTE_PREFIXES: Record<TenantModule, string> = {
  students: '/admin/students',
  courses: '/admin/courses',
  crm: '/admin/crm',
  sales: '/admin/sales',
  content: '/admin/content',
}

/** A que módulo pertence um caminho /admin/*, ou null se for uma rota partilhada (ex.: /admin, /admin/settings). */
export function getModuleForPath(pathname: string): TenantModule | null {
  for (const module of TENANT_MODULES) {
    if (pathname.startsWith(MODULE_ROUTE_PREFIXES[module])) return module
  }
  return null
}

/**
 * Hierarquia de gestão de contas: quem pode bloquear/desbloquear ou mudar o
 * papel de quem. ADMIN e DIRECTOR têm autoridade total idêntica sobre
 * qualquer conta, incluindo promover alguém a ADMIN/DIRECTOR. TENANT_ADMIN
 * só gere STUDENT (e mesmo assim, sujeito a ter a permissão 'students' —
 * ver hasModuleAccess). Sem isto, um TENANT_ADMIN conseguia escalar
 * privilégios alterando o próprio papel ou o de outro staff.
 */
export function canManageUser(actorRole: AppRole, targetRole: AppRole): boolean {
  if (SUPERADMIN_ROLES.includes(actorRole)) return true
  if (actorRole === 'TENANT_ADMIN') return targetRole === 'STUDENT'
  return false
}

/**
 * Acesso por módulo dentro de /admin — superadmins têm tudo; TENANT_ADMIN
 * só o que lhe foi explicitamente atribuído; qualquer outro papel, nada.
 */
export function hasModuleAccess(user: { role: AppRole; permissions?: string[] }, module: TenantModule): boolean {
  if (SUPERADMIN_ROLES.includes(user.role)) return true
  if (user.role === 'TENANT_ADMIN') return (user.permissions ?? []).includes(module)
  return false
}
