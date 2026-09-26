'use client'

import { toast } from 'sonner'
import { Bell, BellOff } from 'lucide-react'
import { usePushNotification } from '@/hooks/usePushNotification'

export function PushNotificationToggle() {
  const { isSupported, isSubscribed, isPending, subscribe, unsubscribe } = usePushNotification()

  async function handleClick() {
    try {
      if (isSubscribed) {
        await unsubscribe()
        toast.success('Notificações desativadas.')
      } else {
        await subscribe()
        toast.success('Notificações ativadas!')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível atualizar as notificações.')
    }
  }

  if (!isSupported) {
    return <p className="text-sm text-muted-foreground">O seu navegador não suporta notificações push.</p>
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="flex min-h-11 items-center gap-3 rounded-xl border border-border px-4 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-60"
    >
      {isSubscribed ? <BellOff size={17} /> : <Bell size={17} />}
      {isPending ? 'A atualizar...' : isSubscribed ? 'Desativar notificações' : 'Ativar notificações'}
    </button>
  )
}
