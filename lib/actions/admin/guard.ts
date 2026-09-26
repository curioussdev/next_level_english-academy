import 'server-only'
import type { Session } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { ADMIN_ROLES, STAFF_ROLES, hasModuleAccess, type TenantModule } from '@/lib/constants/roles'
import { isDemoUser } from '@/lib/demo'

/** Shape padrão devolvida por Server Actions ligadas a useActionState em formulários de admin. */
export type ActionState = { error: string } | undefined

/**
 * A sessão é JWT: bloquear um utilizador, mudar o seu papel ou revogar
 * permissões de sub-admin não invalida sessões já emitidas (só expiram
 * sozinhas ou com logout manual). Por isso toda ação administrativa
 * reconfirma o estado atual direto na BD antes de decidir — nunca confia
 * cegamente em `role`/`permissions` do token, que podem estar até 30 dias
 * desatualizados.
 */
async function withFreshUser(session: Session) {
  const fresh = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isBlocked: true, permissions: true },
  })
  if (!fresh || fresh.isBlocked) {
    throw new Error('Não autorizado.')
  }
  return { ...session, user: { ...session.user, role: fresh.role, permissions: fresh.permissions } }
}

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
  const fresh = await withFreshUser(session)
  if (!STAFF_ROLES.includes(fresh.user.role)) {
    throw new Error('Não autorizado.')
  }
  return fresh
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
  const fresh = await withFreshUser(session)
  if (!ADMIN_ROLES.includes(fresh.user.role)) {
    throw new Error('Não autorizado.')
  }
  return fresh
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
