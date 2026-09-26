import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { isDemoUser } from '@/lib/demo'
import { loadNotificationsForUser } from '@/lib/notifications'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login?callbackUrl=/student')
  }
  // Bloqueio de conta é verificado no Proxy (lib/auth.config.ts), antes de
  // qualquer render — ver comentário lá para o porquê de não repetir aqui.

  const notifications = await loadNotificationsForUser(session.user.id)

  return (
    <DashboardShell role="student" userName={session.user.name ?? 'Aluno'} isDemo={isDemoUser(session.user.id)} notifications={notifications}>
      {children}
    </DashboardShell>
  )
}
