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
          isActive ? 'bg-muted text-muted-foreground hover:opacity-80' : 'bg-success/10 text-success hover:bg-success/20'
        }`}
      >
        {isPending ? '...' : isActive ? 'Ocultar' : 'Publicar'}
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="grid h-9 w-9 place-items-center rounded-lg text-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-60"
        aria-label="Apagar depoimento"
      >
        <Trash2 size={15} />
      </button>
    </div>
  )
}
