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
        isPublished ? 'bg-muted text-muted-foreground hover:opacity-80' : 'bg-success text-success-foreground hover:opacity-90'
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
      className="flex min-h-11 items-center rounded-xl border border-destructive/30 px-4 text-sm font-semibold text-destructive transition hover:bg-destructive/10 disabled:opacity-60"
    >
      {isPending ? '...' : 'Apagar curso'}
    </button>
  )
}
