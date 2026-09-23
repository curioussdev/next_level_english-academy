self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    payload = { title: 'Next Level', body: event.data.text() }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title ?? 'Next Level', {
      body: payload.body,
      icon: '/icon.svg',
      data: { url: payload.url ?? '/student' },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/student'
  event.waitUntil(self.clients.openWindow(url))
})
