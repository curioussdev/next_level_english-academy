'use client'

import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteTestimonial, toggleTestimonialActive } from '@/lib/actions/admin/testimonials'

export function TestimonialActions({ id, isActive }: { id: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(async () => {
      try {
        await toggleTestimonialActive(id, !isActive)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Não foi possível atualizar.')
      }
    })
  }

  function handleDelete() {
    if (!confirm('Apagar este depoimento?')) return
    startTransition(async () => {
      try {
        await deleteTestimonial(id)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Não foi possível apagar.')
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        className={`min-h-9 rounded-lg px-3 text-xs font-semibold transition disabled:opacity-60 ${
          isActive ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
        }`}
      >
        {isPending ? '...' : isActive ? 'Ocultar' : 'Publicar'}
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="grid h-9 w-9 place-items-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
        aria-label="Apagar depoimento"
      >
        <Trash2 size={15} />
      </button>
    </div>
  )
}
