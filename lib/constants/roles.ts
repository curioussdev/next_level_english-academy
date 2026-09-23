import type { Role } from '@prisma/client'

// Reexportado como tipo — nunca duplique esta união à mão em outro arquivo
// (a Fase 1 já causou um bug de tipos por causa de uma cópia desatualizada).
export type AppRole = Role

export const ADMIN_ROLES: AppRole[] = ['ADMIN', 'DIRECTOR']
export const STAFF_ROLES: AppRole[] = ['INSTRUCTOR', 'ADMIN', 'DIRECTOR']

/**
 * Hierarquia de gestão de contas: quem pode bloquear/desbloquear ou mudar o
 * papel de quem. DIRECTOR tem autoridade total; ADMIN só gere STUDENT e
 * INSTRUCTOR — nunca outro ADMIN nem um DIRECTOR. Sem isto, qualquer ADMIN
 * conseguia bloquear o Director da plataforma ou rebaixar outro ADMIN.
 */
export function canManageUser(actorRole: AppRole, targetRole: AppRole): boolean {
  if (actorRole === 'DIRECTOR') return true
  if (actorRole === 'ADMIN') return targetRole === 'STUDENT' || targetRole === 'INSTRUCTOR'
  return false
}
