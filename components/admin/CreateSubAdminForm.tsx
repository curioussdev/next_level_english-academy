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
  'mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-violet-100'

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
      <div className="mt-3 space-y-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
        <p className="text-sm text-foreground">
          Sub-admin <span className="font-semibold text-foreground">{name}</span> criado com acesso a: {permissions.map((m) => MODULE_LABELS[m]).join(', ') || 'nenhum módulo'}.
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
          className="rounded-xl bg-muted px-4 py-2.5 text-sm font-semibold text-foreground transition hover:opacity-80"
        >
          Criar outro sub-admin
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="sa-name" className="text-sm font-medium text-foreground">
            Nome
          </label>
          <input id="sa-name" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="sa-email" className="text-sm font-medium text-foreground">
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
        <p className="text-sm font-medium text-foreground">Módulos permitidos</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {TENANT_MODULES.map((module) => (
            <label
              key={module}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                permissions.includes(module)
                  ? 'border-violet-300 bg-primary/10 text-primary dark:border-violet-800'
                  : 'border-border text-muted-foreground'
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

      {error && <p className="text-sm text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="h-11 rounded-xl bg-primary px-6 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? 'A criar...' : 'Criar sub-admin'}
      </button>
    </form>
  )
}
