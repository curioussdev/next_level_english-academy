import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { isDemoUser } from '@/lib/demo'
import { loadNotificationsForUser } from '@/lib/notifications'
import { STAFF_ROLES, SUPERADMIN_ROLES } from '@/lib/constants/roles'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login?callbackUrl=/admin')
  }
  if (!STAFF_ROLES.includes(session.user.role)) {
    redirect('/student')
  }
  // Bloqueio de conta é verificado no Proxy (lib/auth.config.ts), antes de
  // qualquer render — ver comentário lá para o porquê de não repetir aqui.

  const notifications = await loadNotificationsForUser(session.user.id)

  return (
    <DashboardShell
      role="admin"
      userName={session.user.name ?? 'Admin'}
      isDemo={isDemoUser(session.user.id)}
      permissions={session.user.role === 'TENANT_ADMIN' ? session.user.permissions : undefined}
      isSuperAdmin={SUPERADMIN_ROLES.includes(session.user.role)}
      notifications={notifications}
    >
      {children}
    </DashboardShell>
  )
}
