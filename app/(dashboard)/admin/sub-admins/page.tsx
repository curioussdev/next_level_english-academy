import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { isDemoUser } from '@/lib/demo'
import { formatDate } from '@/lib/format'
import { SUPERADMIN_ROLES } from '@/lib/constants/roles'
import { CreateSubAdminForm } from '@/components/admin/CreateSubAdminForm'
import { SubAdminPermissionsEditor } from '@/components/admin/SubAdminPermissionsEditor'

export default async function SubAdminsPage() {
  const session = await auth()
  if (!SUPERADMIN_ROLES.includes(session!.user.role)) {
    redirect('/admin')
  }
  const isDemo = isDemoUser(session!.user.id)

  const subAdmins = isDemo
    ? []
    : await prisma.user.findMany({
        where: { role: 'TENANT_ADMIN' },
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, permissions: true, isBlocked: true, createdAt: true },
      })

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight">Sub-admins</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">
        Administradores delegados com acesso limitado por módulo — sem afetar a autoridade total de Admin/Director.
      </p>

      <h2 className="mt-8 text-lg font-bold">Criar sub-admin</h2>
      <CreateSubAdminForm />

      <h2 className="mt-10 text-lg font-bold">Sub-admins existentes</h2>
      {isDemo && <p className="mt-3 text-sm text-slate-400">Modo demo — sem banco conectado, lista vazia.</p>}
      {!isDemo && subAdmins.length === 0 && <p className="mt-3 text-sm text-slate-400">Ainda sem sub-admins criados.</p>}
      <div className="mt-3 space-y-3">
        {subAdmins.map((user) => (
          <div key={user.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">{user.name ?? user.email}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user.email} · desde {formatDate(user.createdAt)} {user.isBlocked && '· bloqueado'}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <SubAdminPermissionsEditor userId={user.id} initialPermissions={user.permissions} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
