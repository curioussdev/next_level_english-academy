import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isDemoUser } from '@/lib/demo'
import { OwnProfileForm } from '@/components/shared/OwnProfileForm'

export default async function AdminSettingsPage() {
  const session = await auth()
  const isDemo = isDemoUser(session!.user.id)

  const user = isDemo
    ? null
    : await prisma.user.findUniqueOrThrow({
        where: { id: session!.user.id },
        select: { name: true, phone: true, bio: true, dateOfBirth: true, country: true, city: true },
      })

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>

      <div className="mt-6 rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
        <h2 className="font-bold">Meu perfil</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">O nome é obrigatório e aparece em todo o painel administrativo.</p>
        <div className="mt-4">
          {isDemo ? (
            <p className="text-sm text-slate-400">Modo demo — sem banco conectado, edição indisponível.</p>
          ) : (
            <OwnProfileForm
              showLearnerFields={false}
              initial={{
                name: user!.name ?? '',
                phone: user!.phone ?? '',
                bio: user!.bio ?? '',
                dateOfBirth: user!.dateOfBirth ? user!.dateOfBirth.toISOString().slice(0, 10) : '',
                country: user!.country ?? '',
                city: user!.city ?? '',
                currentLevel: '',
                learningGoals: '',
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
