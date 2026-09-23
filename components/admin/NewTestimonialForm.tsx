'use client'

import { useActionState } from 'react'
import { createTestimonial } from '@/lib/actions/admin/testimonials'

export function NewTestimonialForm() {
  const [state, formAction, pending] = useActionState(createTestimonial, undefined)

  return (
    <form action={formAction} className="space-y-4 rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
      {state?.error && <p className="rounded-lg bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <div className="grid grid-cols-[1fr_auto] gap-4">
        <div>
          <label htmlFor="authorName" className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Nome do aluno
          </label>
          <input
            id="authorName"
            name="authorName"
            required
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
        </div>
        <div>
          <label htmlFor="rating" className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Nota
          </label>
          <select
            id="rating"
            name="rating"
            defaultValue="5"
            className="mt-1 h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} ★
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="content" className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Depoimento
        </label>
        <textarea
          id="content"
          name="content"
          rows={3}
          required
          className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="flex min-h-11 items-center justify-center rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
      >
        {pending ? 'A adicionar...' : 'Adicionar depoimento'}
      </button>
    </form>
  )
}
