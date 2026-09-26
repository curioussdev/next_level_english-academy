'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createCourse } from '@/lib/actions/admin/courses'

export default function CreateCoursePage() {
  const [state, formAction, pending] = useActionState(createCourse, undefined)

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/courses" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={16} /> Cursos
      </Link>

      <h1 className="mt-4 text-3xl font-bold tracking-tight">Novo curso</h1>

      <form action={formAction} className="mt-6 space-y-4 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border">
        {state?.error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>}

        <div>
          <label htmlFor="title" className="text-sm font-medium text-foreground">
            Título
          </label>
          <input
            id="title"
            name="title"
            required
            className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label htmlFor="description" className="text-sm font-medium text-foreground">
            Descrição
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="text-sm font-medium text-foreground">
              Preço (€)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              required
              defaultValue="0"
              className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label htmlFor="level" className="text-sm font-medium text-foreground">
              Nível
            </label>
            <select
              id="level"
              name="level"
              className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="category" className="text-sm font-medium text-foreground">
            Categoria
          </label>
          <input
            id="category"
            name="category"
            className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-2 flex min-h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {pending ? 'A criar...' : 'Criar curso'}
        </button>
      </form>
    </div>
  )
}
