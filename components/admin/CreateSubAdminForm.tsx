'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { createStaffUser } from '@/lib/actions/admin/users'
import { TENANT_MODULES, type TenantModule } from '@/lib/constants/roles'
import { CopyableSecret } from '@/components/shared/CopyableSecret'

const MODULE_LABELS: Record<TenantModule, string> = {
  students: 'Alunos',
  courses: 'Cursos',
  crm: 'CRM',
  sales: 'Vendas',
  content: 'Conteúdo',
}

const inputClass =
  'mt-1 h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100'

export function CreateSubAdminForm() {
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [permissions, setPermissions] = useState<TenantModule[]>([])
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ tempPassword: string } | null>(null)

  function toggleModule(module: TenantModule) {
    setPermissions((prev) => (prev.includes(module) ? prev.filter((m) => m !== module) : [...prev, module]))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      try {
        const created = await createStaffUser({ name, email, role: 'TENANT_ADMIN', permissions })
        setResult(created)
        toast.success('Sub-admin criado.')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Não foi possível criar o sub-admin.')
      }
    })
  }

  if (result) {
    return (
      <div className="mt-3 space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Sub-admin <span className="font-semibold text-slate-900 dark:text-white">{name}</span> criado com acesso a: {permissions.map((m) => MODULE_LABELS[m]).join(', ') || 'nenhum módulo'}.
        </p>
        <CopyableSecret label="Senha temporária" value={result.tempPassword} />
        <button
          type="button"
          onClick={() => {
            setResult(null)
            setName('')
            setEmail('')
            setPermissions([])
          }}
          className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Criar outro sub-admin
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="sa-name" className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Nome
          </label>
          <input id="sa-name" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="sa-email" className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Email
          </label>
          <input
            id="sa-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Módulos permitidos</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {TENANT_MODULES.map((module) => (
            <label
              key={module}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                permissions.includes(module)
                  ? 'border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-500/10 dark:text-violet-300'
                  : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400'
              }`}
            >
              <input
                type="checkbox"
                checked={permissions.includes(module)}
                onChange={() => toggleModule(module)}
                className="accent-violet-500"
              />
              {MODULE_LABELS[module]}
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="h-11 rounded-xl bg-violet-600 px-6 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
      >
        {isPending ? 'A criar...' : 'Criar sub-admin'}
      </button>
    </form>
  )
}
