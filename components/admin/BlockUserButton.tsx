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
        isBlocked ? 'bg-teal-50 text-teal-700 hover:bg-teal-100' : 'bg-red-50 text-red-600 hover:bg-red-100'
      }`}
    >
      {isPending ? '...' : isBlocked ? 'Desbloquear' : 'Bloquear'}
    </button>
  )
}
