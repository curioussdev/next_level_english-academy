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
        isBlocked ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300 hover:bg-teal-100' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100'
      }`}
    >
      {isPending ? '...' : isBlocked ? 'Desbloquear' : 'Bloquear'}
    </button>
  )
}
