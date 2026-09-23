'use client'

import { useActionState } from 'react'
import { saveHeroContent } from '@/lib/actions/admin/cms'

export function HeroContentForm({ title, subtitle }: { title: string; subtitle: string }) {
  const [state, formAction, pending] = useActionState(saveHeroContent, undefined)

  return (
    <form action={formAction} className="space-y-4 rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
      {state?.error && <p className="rounded-lg bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <div>
        <label htmlFor="title" className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Título principal
        </label>
        <textarea
          id="title"
          name="title"
          rows={2}
          defaultValue={title}
          required
          className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
        />
      </div>

      <div>
        <label htmlFor="subtitle" className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Subtítulo
        </label>
        <textarea
          id="subtitle"
          name="subtitle"
          rows={3}
          defaultValue={subtitle}
          required
          className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex min-h-11 items-center justify-center rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
      >
        {pending ? 'A guardar...' : 'Guardar e publicar'}
      </button>
    </form>
  )
}
