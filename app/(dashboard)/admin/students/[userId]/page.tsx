import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BlockUserButton } from '@/components/admin/BlockUserButton'
import { RoleSelect } from '@/components/admin/RoleSelect'
import { DEMO_USERS_LIST, isDemoUser } from '@/lib/demo'
import { canManageUser } from '@/lib/constants/roles'
import { formatDate } from '@/lib/format'

export default async function AdminStudentDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const session = await auth()
  const viewerIsDemo = isDemoUser(session!.user.id)

  const user = viewerIsDemo
    ? DEMO_USERS_LIST.find((u) => u.id === userId)
    : await prisma.user.findUnique({
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
          _count: { select: { enrollments: true } },
        },
      })

  if (!user) notFound()

  const isSelf = session!.user.id === user.id
  const canManage = !isSelf && canManageUser(session!.user.role, user.role)

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">{user.name ?? user.email}</h1>
      <p className="mt-1 text-slate-500">{user.email}</p>

      <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Role</p>
            {canManage ? (
              <RoleSelect userId={user.id} currentRole={user.role} />
            ) : (
              <p className="mt-1 text-sm font-medium text-slate-700">{user.role}{isSelf && ' (você)'}</p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Status</p>
            <p className="mt-1 text-sm font-medium text-slate-700">{user.isBlocked ? 'Bloqueado' : 'Ativo'}</p>
            {user.isBlocked && 'blockedReason' in user && user.blockedReason && (
              <p className="mt-1 text-xs text-slate-400">Motivo: {user.blockedReason}</p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Membro desde</p>
            <p className="mt-1 text-sm font-medium text-slate-700">{formatDate(user.createdAt)}</p>
          </div>
          {'_count' in user && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Matrículas</p>
              <p className="mt-1 text-sm font-medium text-slate-700">{user._count.enrollments}</p>
            </div>
          )}
        </div>

        {canManage && (
          <div className="mt-6 border-t border-slate-100 pt-6">
            <BlockUserButton userId={user.id} isBlocked={user.isBlocked} />
          </div>
        )}
      </div>
    </div>
  )
}
