'use client'

import { useEffect, useState, useTransition } from 'react'
import { Bell } from 'lucide-react'
import { markAllNotificationsRead, markNotificationRead } from '@/lib/actions/notifications'
import { formatDateTime } from '@/lib/format'

export interface NotificationItem {
  id: string
  title: string
  message: string
  isRead: boolean
  createdAt: Date
}

export function NotificationBell({ notifications }: { notifications: NotificationItem[] }) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState(notifications)
  const [, startTransition] = useTransition()

  // O layout (Server Component) busca notificações de novo a cada navegação
  // — sem isto, o sino ficava congelado nos dados do primeiro mount.
  useEffect(() => {
    setItems(notifications)
  }, [notifications])

  const unreadCount = items.filter((n) => !n.isRead).length

  function handleOpen(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    startTransition(() => {
      markNotificationRead(id)
    })
  }

  function handleMarkAll() {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })))
    startTransition(() => {
      markAllNotificationsRead()
    })
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notificações"
        onClick={() => setOpen((v) => !v)}
        className="relative grid h-11 w-11 place-items-center text-muted-foreground"
      >
        <Bell size={19} />
        {unreadCount > 0 && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary" />}
      </button>

      {open && (
        <>
          <button type="button" aria-label="Fechar" className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-card p-2 shadow-xl ring-1 ring-border">
            <div className="flex items-center justify-between px-3 py-2">
              <p className="text-sm font-bold">Notificações</p>
              {unreadCount > 0 && (
                <button type="button" onClick={handleMarkAll} className="text-xs font-semibold text-primary hover:opacity-80">
                  Marcar todas como lidas
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 && <p className="px-3 py-6 text-center text-sm text-muted-foreground">Sem notificações.</p>}
              {items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleOpen(n.id)}
                  className={`block w-full rounded-xl px-3 py-2.5 text-left transition hover:bg-muted ${!n.isRead ? 'bg-primary/10' : ''}`}
                >
                  <p className="text-sm font-semibold text-foreground">{n.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{formatDateTime(n.createdAt)}</p>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
