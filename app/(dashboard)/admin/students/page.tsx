import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BlockUserButton } from '@/components/admin/BlockUserButton'
import { DEMO_USERS_LIST, isDemoUser } from '@/lib/demo'
import { canManageUser } from '@/lib/constants/roles'
import { formatDate } from '@/lib/format'

export default async function AdminStudentsPage() {
  const session = await auth()
  const userId = session!.user.id
  const viewerRole = session!.user.role

  const users = isDemoUser(userId)
    ? DEMO_USERS_LIST
    : await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, isBlocked: true, createdAt: true },
      })

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alunos</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">{users.length} pessoas registadas na plataforma.</p>
        </div>
        <Link
          href="/admin/students/new"
          className="shrink-0 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          Novo aluno
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-3xl bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-100 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-400">
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
              <tr key={user.id} className="border-b border-slate-50 last:border-0">
                <td className="px-5 py-4">
                  <Link href={`/admin/students/${user.id}`} className="font-semibold text-slate-900 dark:text-white hover:text-violet-600">
                    {user.name ?? user.email}
                  </Link>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </td>
                <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{user.role}</td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      user.isBlocked ? 'bg-red-50 dark:bg-red-500/10 text-red-600' : 'bg-teal-50 dark:bg-teal-500/10 text-teal-700'
                    }`}
                  >
                    {user.isBlocked ? 'Bloqueado' : 'Ativo'}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{formatDate(user.createdAt)}</td>
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
