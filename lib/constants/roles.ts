import type { Role } from '@prisma/client'

// Reexportado como tipo — nunca duplique esta união à mão em outro arquivo
// (a Fase 1 já causou um bug de tipos por causa de uma cópia desatualizada).
export type AppRole = Role

export const ADMIN_ROLES: AppRole[] = ['ADMIN', 'DIRECTOR']
export const STAFF_ROLES: AppRole[] = ['INSTRUCTOR', 'ADMIN', 'DIRECTOR']
