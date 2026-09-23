import type { AppRole } from '@/lib/constants/roles'

export const PERMISSIONS: Record<AppRole, string[]> = {
  STUDENT: ['view:own_courses', 'view:own_progress', 'update:own_profile', 'view:certificates'],
  INSTRUCTOR: ['create:courses', 'edit:own_courses', 'view:students_progress', 'create:lessons'],
  ADMIN: [
    'manage:all_courses',
    'manage:users',
    'manage:enrollments',
    'view:analytics',
    'manage:crm',
    'manage:cms',
    'view:financial',
    'block:users',
  ],
  DIRECTOR: [
    'manage:all',
    'manage:system',
    'manage:roles',
    'impersonate:users',
    'view:audit_logs',
    'manage:backups',
    'manage:integrations',
  ],
}

/** DIRECTOR é super-admin: sempre tem acesso, mesmo a permissões não listadas. */
export function hasPermission(role: AppRole, permission: string): boolean {
  if (role === 'DIRECTOR') return true
  return PERMISSIONS[role]?.includes(permission) ?? false
}
