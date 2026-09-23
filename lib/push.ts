import webpush from 'web-push'
import { prisma } from '@/lib/prisma'

let configured = false

function ensureConfigured() {
  if (configured) return
  const publicKey = process.env.VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT ?? 'mailto:contato@nextlevel.pt'

  if (!publicKey || !privateKey) {
    throw new Error('VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY não configuradas.')
  }

  webpush.setVapidDetails(subject, publicKey, privateKey)
  configured = true
}

type PushPayload = { title: string; body: string; url?: string }

async function dispatch(sub: { id: string; endpoint: string; p256dh: string; auth: string }, payload: PushPayload) {
  try {
    await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, JSON.stringify(payload))
  } catch (err) {
    const statusCode = (err as { statusCode?: number }).statusCode
    if (statusCode === 404 || statusCode === 410) {
      // Inscrição expirada/revogada no navegador — limpa do banco.
      await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {})
    } else {
      console.warn('[push] falha ao enviar:', err)
    }
  }
}

/**
 * Envia uma push notification a todas as inscrições ativas do utilizador.
 * Nunca lança: chaves em falta ou uma inscrição expirada não devem derrubar
 * quem chamou isto (ex.: um Server Action de admin).
 */
export async function sendPushToUser(userId: string, payload: PushPayload) {
  return sendPushToUsers([userId], payload)
}

/**
 * Igual a sendPushToUser, mas para vários destinatários de uma vez — busca
 * todas as inscrições numa única query em vez de uma por utilizador
 * (importante ao notificar todos os alunos matriculados num curso).
 */
export async function sendPushToUsers(userIds: string[], payload: PushPayload) {
  if (userIds.length === 0) return

  try {
    ensureConfigured()
  } catch (err) {
    console.warn('[push] não configurado:', err instanceof Error ? err.message : err)
    return
  }

  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId: { in: userIds } } })
  await Promise.all(subscriptions.map((sub) => dispatch(sub, payload)))
}
