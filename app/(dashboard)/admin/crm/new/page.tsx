'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createLead } from '@/lib/actions/admin/crm'

export default function NewLeadPage() {
  const [state, formAction, pending] = useActionState(createLead, undefined)

  return (
    <div className="mx-auto max-w-lg">
      <Link href="/admin/crm" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900">
        <ArrowLeft size={16} /> CRM
      </Link>

      <h1 className="mt-4 text-3xl font-bold tracking-tight">Novo lead</h1>

      <form action={formAction} className="mt-6 space-y-4 rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
        {state?.error && <p className="rounded-lg bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{state.error}</p>}

        <div>
          <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Nome
          </label>
          <input
            id="name"
            name="name"
            required
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
        </div>

        <div>
          <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Telefone
            </label>
            <input
              id="phone"
              name="phone"
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </div>
          <div>
            <label htmlFor="priority" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Prioridade
            </label>
            <select
              id="priority"
              name="priority"
              defaultValue="MEDIUM"
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            >
              <option value="LOW">Baixa</option>
              <option value="MEDIUM">Média</option>
              <option value="HIGH">Alta</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="source" className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Origem
          </label>
          <select
            id="source"
            name="source"
            defaultValue=""
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          >
            <option value="">Não especificado</option>
            <option value="Instagram">Instagram</option>
            <option value="Facebook">Facebook</option>
            <option value="Google">Google Ads</option>
            <option value="Referral">Indicação</option>
          </select>
        </div>

        <div>
          <label htmlFor="notes" className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Notas
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="flex min-h-11 w-full items-center justify-center rounded-xl bg-violet-600 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
        >
          {pending ? 'A criar...' : 'Criar lead'}
        </button>
      </form>
    </div>
  )
}
