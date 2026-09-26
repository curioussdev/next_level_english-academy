'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { createCourseCheckoutSession } from '@/lib/actions/checkout'

export function CourseBuyButton({ courseId }: { courseId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      try {
        await createCourseCheckoutSession(courseId)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Não foi possível iniciar o checkout.')
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="mt-4 flex min-h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
    >
      {isPending ? 'A abrir checkout...' : 'Comprar curso'}
    </button>
  )
}
