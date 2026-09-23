import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { DashboardShell } from '@/components/layout/DashboardShell'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login?callbackUrl=/student')
  }

  return (
    <DashboardShell role="student" userName={session.user.name ?? 'Aluno'}>
      {children}
    </DashboardShell>
  )
}
