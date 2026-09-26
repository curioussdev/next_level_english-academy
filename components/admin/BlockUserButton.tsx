'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { setUserBlocked } from '@/lib/actions/admin/users'

export function BlockUserButton({ userId, isBlocked }: { userId: string; isBlocked: boolean }) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      try {
        await setUserBlocked(userId, !isBlocked)
        toast.success(isBlocked ? 'Aluno desbloqueado.' : 'Aluno bloqueado.')
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
      className={`min-h-9 rounded-lg px-3 text-xs font-semibold transition disabled:opacity-60 ${
        isBlocked ? 'bg-success/10 text-success hover:bg-success/20' : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
      }`}
    >
      {isPending ? '...' : isBlocked ? 'Desbloquear' : 'Bloquear'}
    </button>
  )
}
