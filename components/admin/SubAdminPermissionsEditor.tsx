'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { updateUserPermissions } from '@/lib/actions/admin/users'
import { TENANT_MODULES, type TenantModule } from '@/lib/constants/roles'

const MODULE_LABELS: Record<TenantModule, string> = {
  students: 'Alunos',
  courses: 'Cursos',
  crm: 'CRM',
  sales: 'Vendas',
  content: 'Conteúdo',
}

export function SubAdminPermissionsEditor({ userId, initialPermissions }: { userId: string; initialPermissions: string[] }) {
  const [isPending, startTransition] = useTransition()
  const [permissions, setPermissions] = useState<TenantModule[]>(initialPermissions.filter((p): p is TenantModule => (TENANT_MODULES as readonly string[]).includes(p)))
  const [dirty, setDirty] = useState(false)

  function toggleModule(module: TenantModule) {
    setPermissions((prev) => (prev.includes(module) ? prev.filter((m) => m !== module) : [...prev, module]))
    setDirty(true)
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await updateUserPermissions(userId, permissions)
        toast.success('Permissões atualizadas.')
        setDirty(false)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Não foi possível atualizar.')
      }
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {TENANT_MODULES.map((module) => (
        <label
          key={module}
          className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition ${
            permissions.includes(module)
              ? 'border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-500/10 dark:text-violet-300'
              : 'border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400'
          }`}
        >
          <input type="checkbox" checked={permissions.includes(module)} onChange={() => toggleModule(module)} className="accent-violet-500" />
          {MODULE_LABELS[module]}
        </label>
      ))}
      {dirty && (
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
        >
          {isPending ? '...' : 'Guardar'}
        </button>
      )}
    </div>
  )
}
