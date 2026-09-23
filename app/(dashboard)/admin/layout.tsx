import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { isDemoUser } from '@/lib/demo'
import { loadNotificationsForUser } from '@/lib/notifications'
import { STAFF_ROLES } from '@/lib/constants/roles'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login?callbackUrl=/admin')
  }
  if (!STAFF_ROLES.includes(session.user.role)) {
    redirect('/student')
  }

  const notifications = await loadNotificationsForUser(session.user.id)

  return (
    <DashboardShell role="admin" userName={session.user.name ?? 'Admin'} isDemo={isDemoUser(session.user.id)} notifications={notifications}>
      {children}
    </DashboardShell>
  )
}
