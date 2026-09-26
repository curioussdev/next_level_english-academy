import { notFound } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BlockUserButton } from '@/components/admin/BlockUserButton'
import { RoleSelect } from '@/components/admin/RoleSelect'
import { DEMO_USERS_LIST, isDemoUser } from '@/lib/demo'
import { canManageUser } from '@/lib/constants/roles'
import { formatDate } from '@/lib/format'
import { safeQuery } from '@/lib/db-safe'

export default async function AdminStudentDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const session = await auth()
  const viewerIsDemo = isDemoUser(session!.user.id)

  const user = viewerIsDemo
    ? DEMO_USERS_LIST.find((u) => u.id === userId)
    : await safeQuery(
        () =>
          prisma.user.findUnique({
            where: { id: userId },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isBlocked: true,
              blockedReason: true,
              createdAt: true,
              lastLoginAt: true,
              nif: true,
              _count: { select: { enrollments: true } },
            },
          }),
        null,
        'detalhe do aluno',
      )

  if (!user) notFound()

  const isSelf = session!.user.id === user.id
  const canManage = !isSelf && canManageUser(session!.user.role, user.role)

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">{user.name ?? user.email}</h1>
      <p className="mt-1 text-muted-foreground">{user.email}</p>

      <div className="mt-6 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role</p>
            {canManage ? (
              <RoleSelect userId={user.id} currentRole={user.role} />
            ) : (
              <p className="mt-1 text-sm font-medium text-foreground">{user.role}{isSelf && ' (você)'}</p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</p>
            <p className="mt-1 text-sm font-medium text-foreground">{user.isBlocked ? 'Bloqueado' : 'Ativo'}</p>
            {user.isBlocked && 'blockedReason' in user && user.blockedReason && (
              <p className="mt-1 text-xs text-muted-foreground">Motivo: {user.blockedReason}</p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Membro desde</p>
            <p className="mt-1 text-sm font-medium text-foreground">{formatDate(user.createdAt)}</p>
          </div>
          {'_count' in user && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Matrículas</p>
              <p className="mt-1 text-sm font-medium text-foreground">{user._count.enrollments}</p>
            </div>
          )}
          {'nif' in user && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">NIF</p>
              <p className="mt-1 text-sm font-medium text-foreground">{user.nif ?? '—'}</p>
            </div>
          )}
        </div>

        {canManage && (
          <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-6">
            <Link
              href={`/admin/students/${user.id}/edit`}
              className="rounded-lg bg-muted px-3 py-2 text-xs font-semibold text-foreground transition hover:opacity-80"
            >
              Editar perfil
            </Link>
            <BlockUserButton userId={user.id} isBlocked={user.isBlocked} />
          </div>
        )}
      </div>
    </div>
  )
}
