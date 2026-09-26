import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isDemoUser } from '@/lib/demo'
import { OwnProfileForm } from '@/components/shared/OwnProfileForm'
import { safeQuery } from '@/lib/db-safe'

export default async function AdminSettingsPage() {
  const session = await auth()
  const isDemo = isDemoUser(session!.user.id)

  const user = isDemo
    ? null
    : await safeQuery(
        () =>
          prisma.user.findUnique({
            where: { id: session!.user.id },
            select: { name: true, phone: true, bio: true, dateOfBirth: true, country: true, city: true },
          }),
        null,
        'perfil do admin',
      )

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>

      <div className="mt-6 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border">
        <h2 className="font-bold">Meu perfil</h2>
        <p className="mt-1 text-sm text-muted-foreground">O nome é obrigatório e aparece em todo o painel administrativo.</p>
        <div className="mt-4">
          {isDemo ? (
            <p className="text-sm text-muted-foreground">Modo demo — sem banco conectado, edição indisponível.</p>
          ) : user ? (
            <OwnProfileForm
              showLearnerFields={false}
              initial={{
                name: user.name ?? '',
                phone: user.phone ?? '',
                bio: user.bio ?? '',
                dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString().slice(0, 10) : '',
                country: user.country ?? '',
                city: user.city ?? '',
                currentLevel: '',
                learningGoals: '',
              }}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Não foi possível carregar o seu perfil agora. Tente novamente dentro de momentos.</p>
          )}
        </div>
      </div>
    </div>
  )
}
