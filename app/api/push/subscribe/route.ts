import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isDemoUser } from '@/lib/demo'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  }
  if (isDemoUser(session.user.id)) {
    return NextResponse.json({ error: 'Modo demo: ligue um banco de dados real.' }, { status: 400 })
  }

  const body = (await req.json()) as { endpoint?: string; keys?: { p256dh?: string; auth?: string } }
  const { endpoint, keys } = body

  if (!endpoint || !keys?.p256dh || !keys.auth) {
    return NextResponse.json({ error: 'Inscrição inválida.' }, { status: 400 })
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { userId: session.user.id, p256dh: keys.p256dh, auth: keys.auth },
    create: { userId: session.user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth },
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  }

  const body = (await req.json()) as { endpoint?: string }
  if (!body.endpoint) {
    return NextResponse.json({ error: 'endpoint em falta.' }, { status: 400 })
  }

  await prisma.pushSubscription.deleteMany({ where: { endpoint: body.endpoint, userId: session.user.id } })

  return NextResponse.json({ ok: true })
}
