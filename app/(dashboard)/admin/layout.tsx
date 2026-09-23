import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { DashboardShell } from '@/components/layout/DashboardShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login?callbackUrl=/admin')
  }
  if (session.user.role !== 'ADMIN' && session.user.role !== 'INSTRUCTOR' && session.user.role !== 'DIRECTOR') {
    redirect('/student')
  }

  return (
    <DashboardShell role="admin" userName={session.user.name ?? 'Admin'}>
      {children}
    </DashboardShell>
  )
}
