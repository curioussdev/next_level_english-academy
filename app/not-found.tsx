import Link from 'next/link'
import { Home, LayoutDashboard } from 'lucide-react'
import { auth } from '@/lib/auth'
import { NotFoundScene } from '@/components/errors/NotFoundScene'

export default async function NotFound() {
  const session = await auth()
  const role = session?.user?.role

  const dashboardHref = role === 'STUDENT' || !role ? '/student' : '/admin'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-5 py-16 text-center text-slate-900 dark:bg-slate-950 dark:text-white">
      <NotFoundScene />

      <p className="mt-8 text-sm font-bold uppercase tracking-[.2em] text-violet-600 dark:text-violet-400">Erro 404</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Esta página fugiu da aula.</h1>
      <p className="mt-4 max-w-md text-slate-500 dark:text-slate-400">
        O link pode estar desatualizado ou a página foi movida. Vamos levá-lo de volta ao caminho certo.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {session?.user ? (
          <Link
            href={dashboardHref}
            className="flex items-center justify-center gap-2 rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            <LayoutDashboard size={18} /> Voltar ao dashboard
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            <LayoutDashboard size={18} /> Entrar
          </Link>
        )}
        <Link
          href="/"
          className="flex items-center justify-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
        >
          <Home size={18} /> Página inicial
        </Link>
      </div>
    </div>
  )
}
