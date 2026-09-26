import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BlockUserButton } from '@/components/admin/BlockUserButton'
import { DEMO_USERS_LIST, isDemoUser } from '@/lib/demo'
import { canManageUser } from '@/lib/constants/roles'
import { formatDate } from '@/lib/format'
import { safeQuery } from '@/lib/db-safe'

export default async function AdminStudentsPage() {
  const session = await auth()
  const userId = session!.user.id
  const viewerRole = session!.user.role

  const users = isDemoUser(userId)
    ? DEMO_USERS_LIST
    : await safeQuery(
        () =>
          prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: { id: true, name: true, email: true, role: true, isBlocked: true, createdAt: true },
          }),
        [],
        'lista de alunos',
      )

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alunos</h1>
          <p className="mt-2 text-muted-foreground">{users.length} pessoas registadas na plataforma.</p>
        </div>
        <Link
          href="/admin/students/new"
          className="shrink-0 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Novo aluno
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-3xl bg-card shadow-sm ring-1 ring-border">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-semibold">Nome</th>
              <th className="px-5 py-3 font-semibold">Role</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Desde</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border last:border-0">
                <td className="px-5 py-4">
                  <Link href={`/admin/students/${user.id}`} className="font-semibold text-foreground hover:text-violet-600">
                    {user.name ?? user.email}
                  </Link>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </td>
                <td className="px-5 py-4 text-muted-foreground">{user.role}</td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      user.isBlocked ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'
                    }`}
                  >
                    {user.isBlocked ? 'Bloqueado' : 'Ativo'}
                  </span>
                </td>
                <td className="px-5 py-4 text-muted-foreground">{formatDate(user.createdAt)}</td>
                <td className="px-5 py-4 text-right">
                  {user.id !== userId && canManageUser(viewerRole, user.role) && (
                    <BlockUserButton userId={user.id} isBlocked={user.isBlocked} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
