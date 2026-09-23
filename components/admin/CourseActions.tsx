'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { deleteCourse, toggleCoursePublish } from '@/lib/actions/admin/courses'

export function PublishToggle({ courseId, isPublished }: { courseId: string; isPublished: boolean }) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      try {
        await toggleCoursePublish(courseId, !isPublished)
        toast.success(isPublished ? 'Curso despublicado.' : 'Curso publicado.')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Não foi possível atualizar.')
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold transition disabled:opacity-60 ${
        isPublished ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-teal-600 text-white hover:bg-teal-700'
      }`}
    >
      {isPending ? '...' : isPublished ? 'Despublicar' : 'Publicar'}
    </button>
  )
}

export function DeleteCourseButton({ courseId }: { courseId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm('Apagar este curso e todo o seu conteúdo? Esta ação não pode ser desfeita.')) return
    startTransition(async () => {
      try {
        await deleteCourse(courseId)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Não foi possível apagar.')
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="flex min-h-11 items-center rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-600 dark:text-red-400 transition hover:bg-red-50 disabled:opacity-60"
    >
      {isPending ? '...' : 'Apagar curso'}
    </button>
  )
}
