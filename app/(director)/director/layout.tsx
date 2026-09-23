import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { SignOutButton } from '@/components/layout/SignOutButton'

export default async function DirectorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login?callbackUrl=/director')
  }
  if (session.user.role !== 'DIRECTOR') {
    redirect('/student')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="flex h-16 items-center justify-between border-b border-white/10 px-5 lg:px-8">
        <div className="flex items-center gap-2 font-bold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 text-sm font-black">
            N
          </span>
          Director
        </div>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/admin" className="text-white/60 transition hover:text-white">
            Painel Admin
          </Link>
          <SignOutButton className="text-white/60 transition hover:text-white" />
        </nav>
      </header>
      <main className="p-5 lg:p-8">{children}</main>
    </div>
  )
}
