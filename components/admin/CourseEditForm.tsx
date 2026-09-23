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
    <form action={formAction} className="space-y-4 rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
      {state?.error && <p className="rounded-lg bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <div>
        <label htmlFor="title" className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Título
        </label>
        <input
          id="title"
          name="title"
          defaultValue={title}
          required
          className="mt-1 h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
        />
      </div>

      <div>
        <label htmlFor="description" className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Descrição
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={description ?? ''}
          className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="text-sm font-medium text-slate-700 dark:text-slate-200">
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
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
        </div>
        <div>
          <label htmlFor="level" className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Nível
          </label>
          <select
            id="level"
            name="level"
            defaultValue={level ?? 'Beginner'}
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="category" className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Categoria
        </label>
        <input
          id="category"
          name="category"
          defaultValue={category ?? ''}
          className="mt-1 h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex min-h-11 items-center justify-center rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
      >
        {pending ? 'A guardar...' : 'Guardar alterações'}
      </button>
    </form>
  )
}
