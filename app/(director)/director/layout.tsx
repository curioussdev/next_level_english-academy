import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function DirectorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login?callbackUrl=/director')
  }
  if (session.user.role !== 'DIRECTOR') {
    redirect('/student')
  }

  return <div className="min-h-screen bg-slate-950 text-white">{children}</div>
}
