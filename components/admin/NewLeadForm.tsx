'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createLead } from '@/lib/actions/admin/crm'
import type { StaffOption } from '@/components/admin/LeadBoard'

const fieldClassName =
  'mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20'

export function NewLeadForm({ staffOptions }: { staffOptions: StaffOption[] }) {
  const [state, formAction, pending] = useActionState(createLead, undefined)

  return (
    <div className="mx-auto max-w-lg">
      <Link href="/admin/crm" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={16} /> CRM
      </Link>

      <h1 className="mt-4 text-3xl font-bold tracking-tight">Novo lead</h1>

      <form action={formAction} className="mt-6 space-y-4 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border">
        {state?.error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>}

        <div>
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Nome
          </label>
          <input id="name" name="name" required className={fieldClassName} />
        </div>

        <div>
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <input id="email" name="email" type="email" required className={fieldClassName} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="text-sm font-medium text-foreground">
              Telefone
            </label>
            <input id="phone" name="phone" className={fieldClassName} />
          </div>
          <div>
            <label htmlFor="priority" className="text-sm font-medium text-foreground">
              Prioridade
            </label>
            <select id="priority" name="priority" defaultValue="MEDIUM" className={fieldClassName}>
              <option value="LOW">Baixa</option>
              <option value="MEDIUM">Média</option>
              <option value="HIGH">Alta</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="source" className="text-sm font-medium text-foreground">
              Origem
            </label>
            <select id="source" name="source" defaultValue="" className={fieldClassName}>
              <option value="">Não especificado</option>
              <option value="Instagram">Instagram</option>
              <option value="Facebook">Facebook</option>
              <option value="Google">Google Ads</option>
              <option value="Referral">Indicação</option>
            </select>
          </div>
          <div>
            <label htmlFor="assignedTo" className="text-sm font-medium text-foreground">
              Responsável
            </label>
            <select id="assignedTo" name="assignedTo" defaultValue="" className={fieldClassName}>
              <option value="">Sem responsável</option>
              {staffOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="nextFollowUp" className="text-sm font-medium text-foreground">
            Próximo follow-up
          </label>
          <input id="nextFollowUp" name="nextFollowUp" type="date" className={fieldClassName} />
        </div>

        <div>
          <label htmlFor="tags" className="text-sm font-medium text-foreground">
            Tags (separadas por vírgula)
          </label>
          <input id="tags" name="tags" placeholder="Ex.: Plano Pro, Urgente" className={fieldClassName} />
        </div>

        <div>
          <label htmlFor="notes" className="text-sm font-medium text-foreground">
            Notas
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="flex min-h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {pending ? 'A criar...' : 'Criar lead'}
        </button>
      </form>
    </div>
  )
}
