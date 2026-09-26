'use client'

import { useActionState } from 'react'
import { updateCourse, type ActionState } from '@/lib/actions/admin/courses'

interface CourseEditFormProps {
  courseId: string
  title: string
  description: string | null
  price: { toString(): string }
  level: string | null
  category: string | null
}

export function CourseEditForm({ courseId, title, description, price, level, category }: CourseEditFormProps) {
  const boundAction = async (_prevState: ActionState, formData: FormData) => updateCourse(courseId, _prevState, formData)
  const [state, formAction, pending] = useActionState(boundAction, undefined)

  return (
    <form action={formAction} className="space-y-4 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border">
      {state?.error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>}

      <div>
        <label htmlFor="title" className="text-sm font-medium text-foreground">
          Título
        </label>
        <input
          id="title"
          name="title"
          defaultValue={title}
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
          defaultValue={description ?? ''}
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
            defaultValue={String(price)}
            required
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
            defaultValue={level ?? 'Beginner'}
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
          defaultValue={category ?? ''}
          className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? 'A guardar...' : 'Guardar alterações'}
      </button>
    </form>
  )
}
