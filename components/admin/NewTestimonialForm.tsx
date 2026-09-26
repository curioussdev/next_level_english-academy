'use client'

import { useActionState } from 'react'
import { createTestimonial } from '@/lib/actions/admin/testimonials'

export function NewTestimonialForm() {
  const [state, formAction, pending] = useActionState(createTestimonial, undefined)

  return (
    <form action={formAction} className="space-y-4 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border">
      {state?.error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>}
      <div className="grid grid-cols-[1fr_auto] gap-4">
        <div>
          <label htmlFor="authorName" className="text-sm font-medium text-foreground">
            Nome do aluno
          </label>
          <input
            id="authorName"
            name="authorName"
            required
            className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label htmlFor="rating" className="text-sm font-medium text-foreground">
            Nota
          </label>
          <select
            id="rating"
            name="rating"
            defaultValue="5"
            className="mt-1 h-11 rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
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
        <label htmlFor="content" className="text-sm font-medium text-foreground">
          Depoimento
        </label>
        <textarea
          id="content"
          name="content"
          rows={3}
          required
          className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? 'A adicionar...' : 'Adicionar depoimento'}
      </button>
    </form>
  )
}
