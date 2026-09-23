import 'server-only'
import { auth } from '@/lib/auth'
import { ADMIN_ROLES, STAFF_ROLES, hasModuleAccess, type TenantModule } from '@/lib/constants/roles'
import { isDemoUser } from '@/lib/demo'

/** Shape padrão devolvida por Server Actions ligadas a useActionState em formulários de admin. */
export type ActionState = { error: string } | undefined

/**
 * Toda Server Action de admin precisa validar a sessão por conta própria —
 * elas são endpoints públicos e podem ser chamadas diretamente, sem passar
 * pelo layout que faz o redirect. O middleware/layout cobre a navegação,
 * isto cobre a ação em si.
 *
 * Também bloqueia sessões demo aqui, centralizado: sem banco real conectado
 * não há nada para persistir, e sem isto o erro de conexão do Prisma
 * vazaria cru para quem clicasse em qualquer botão de mutação.
 */
export async function requireStaffSession() {
  const session = await auth()
  const role = session?.user?.role
  if (!session?.user || !role || !STAFF_ROLES.includes(role)) {
    throw new Error('Não autorizado.')
  }
  if (isDemoUser(session.user.id)) {
    throw new Error('Modo demo: ligue um banco de dados real para editar conteúdo.')
  }
  return session
}

export async function requireAdminSession() {
  const session = await auth()
  const role = session?.user?.role
  if (!session?.user || !role || !ADMIN_ROLES.includes(role)) {
    throw new Error('Não autorizado.')
  }
  if (isDemoUser(session.user.id)) {
    throw new Error('Modo demo: ligue um banco de dados real para editar dados de utilizadores.')
  }
  return session
}

/**
 * Para ações restritas a um módulo específico (alunos, cursos, CRM, vendas,
 * conteúdo) — superadmins (ADMIN/DIRECTOR) sempre passam; um TENANT_ADMIN só
 * passa se o módulo estiver na sua lista de permissões.
 */
export async function requireModuleSession(module: TenantModule) {
  const session = await requireStaffSession()
  if (!hasModuleAccess(session.user, module)) {
    throw new Error('Não tem permissão para aceder a este módulo.')
  }
  return session
}
