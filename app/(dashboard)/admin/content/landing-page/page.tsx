import Link from 'next/link'
import { auth } from '@/lib/auth'
import { getHeroContent } from '@/lib/cms'
import { HeroContentForm } from '@/components/admin/HeroContentForm'
import { isDemoUser } from '@/lib/demo'

export default async function AdminLandingPageContentPage() {
  const session = await auth()
  const hero = await getHeroContent()

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Landing page</h1>
        <Link href="/" target="_blank" className="text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-800">
          Ver ao vivo
        </Link>
      </div>
      <p className="mt-2 text-slate-500 dark:text-slate-400">Edite o título e subtítulo principais mostrados no topo do site.</p>

      {isDemoUser(session!.user.id) && (
        <p className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-800 dark:text-amber-300">
          Modo demo: os valores abaixo são os que estão publicados agora, mas guardar exige um banco real.
        </p>
      )}

      <div className="mt-6">
        <HeroContentForm title={hero.title} subtitle={hero.subtitle} />
      </div>
    </div>
  )
}
