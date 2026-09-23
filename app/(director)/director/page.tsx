import { CheckCircle2, XCircle } from 'lucide-react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DEMO_ACTIVITY_LOG, isDemoUser } from '@/lib/demo'
import { formatDateTime } from '@/lib/format'

const ACTION_LABELS: Record<string, string> = {
  LOGIN: 'Entrou na plataforma',
  PURCHASE: 'Fez uma compra',
  COURSE_CREATED: 'Criou um curso',
  USER_BLOCKED: 'Bloqueou um utilizador',
  USER_UNBLOCKED: 'Desbloqueou um utilizador',
}

export default async function DirectorPage() {
  const session = await auth()
  const userId = session!.user.id
  const isDemo = isDemoUser(userId)

  const health = getSystemHealth()
  const [activity, dbOk] = isDemo ? [DEMO_ACTIVITY_LOG, true] : await Promise.all([loadActivity(), checkDatabase()])

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-sm text-white/50">Super Admin</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">Painel Director</h1>
      <p className="mt-2 text-white/60">Controlo total sobre a plataforma Next Level.</p>

      <h2 className="mt-8 text-lg font-bold">Saúde do sistema</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <HealthItem label="Base de dados" ok={dbOk} okText="Conectada" badText="Sem conexão (modo demo ativo)" />
        <HealthItem label="Stripe" ok={health.stripe} okText="Configurado" badText="Chaves em falta" />
        <HealthItem label="Google OAuth" ok={health.google} okText="Configurado" badText="Chaves em falta" />
        <HealthItem label="Email (Resend)" ok={health.resend} okText="Configurado" badText="Ainda não configurado" />
        <HealthItem label="Push (VAPID)" ok={health.push} okText="Configurado" badText="Ainda não configurado" />
      </div>

      <h2 className="mt-8 text-lg font-bold">Atividade recente</h2>
      <div className="mt-3 overflow-hidden rounded-3xl border border-white/10 bg-white/[.03]">
        {activity.length === 0 && <p className="p-5 text-sm text-white/40">Ainda sem atividade registada.</p>}
        {activity.map((entry) => (
          <div key={entry.id} className="flex items-center justify-between border-b border-white/5 px-5 py-3 text-sm last:border-0">
            <div>
              <span className="font-semibold">{entry.userName}</span>{' '}
              <span className="text-white/60">{ACTION_LABELS[entry.action] ?? entry.action}</span>
            </div>
            <span className="text-xs text-white/40">{formatDateTime(entry.createdAt)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function getSystemHealth() {
  return {
    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
    google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    resend: Boolean(process.env.RESEND_API_KEY),
    push: Boolean(process.env.VAPID_PUBLIC_KEY),
  }
}

async function checkDatabase() {
  try {
    await prisma.user.count()
    return true
  } catch {
    return false
  }
}

async function loadActivity() {
  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { user: { select: { name: true, email: true } } },
  })

  return logs.map((log) => ({
    id: log.id,
    userName: log.user.name ?? log.user.email,
    action: log.action,
    createdAt: log.createdAt,
  }))
}

function HealthItem({ label, ok, okText, badText }: { label: string; ok: boolean; okText: string; badText: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.03] p-4">
      {ok ? <CheckCircle2 size={20} className="shrink-0 text-teal-400" /> : <XCircle size={20} className="shrink-0 text-amber-400" />}
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-white/50">{ok ? okText : badText}</p>
      </div>
    </div>
  )
}
