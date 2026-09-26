import Link from 'next/link'
import { Plus } from 'lucide-react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { LeadBoard, type Lead } from '@/components/admin/LeadBoard'
import { DEMO_LEADS, DEMO_STAFF_OPTIONS, isDemoUser } from '@/lib/demo'
import { safeQuery } from '@/lib/db-safe'
import { STAFF_ROLES } from '@/lib/constants/roles'

export default async function AdminCrmPage() {
  const session = await auth()
  const userId = session!.user.id
  const demo = isDemoUser(userId)

  let leads: Lead[]
  let staffOptionsList: { id: string; name: string }[]

  if (demo) {
    leads = DEMO_LEADS
    staffOptionsList = DEMO_STAFF_OPTIONS
  } else {
    const [dbLeads, dbStaff] = await Promise.all([
      safeQuery(
        () =>
          prisma.cRMLead.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              source: true,
              status: true,
              priority: true,
              notes: true,
              tags: true,
              assignedTo: true,
              nextFollowUp: true,
              lastContactDate: true,
              createdAt: true,
              userId: true,
            },
          }),
        [],
        'leads do CRM',
      ),
      safeQuery(
        () => prisma.user.findMany({ where: { role: { in: STAFF_ROLES } }, select: { id: true, name: true, email: true } }),
        [],
        'lista de responsáveis',
      ),
    ])
    leads = dbLeads
    staffOptionsList = dbStaff.map((s) => ({ id: s.id, name: s.name ?? s.email }))
  }

  const now = Date.now()
  const weekAgo = now - 7 * 86400000
  const totalLeads = leads.length
  const newThisWeek = leads.filter((l) => l.createdAt.getTime() >= weekAgo).length
  const enrolledCount = leads.filter((l) => l.status === 'ENROLLED').length
  const conversionRate = totalLeads > 0 ? Math.round((enrolledCount / totalLeads) * 100) : 0
  const overdueCount = leads.filter(
    (l) => l.nextFollowUp && l.nextFollowUp.getTime() < now && l.status !== 'ENROLLED' && l.status !== 'LOST',
  ).length

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CRM — Leads</h1>
          <p className="mt-2 text-muted-foreground">Arraste os cartões entre colunas ou clique num lead para ver detalhes.</p>
        </div>
        <Link
          href="/admin/crm/new"
          className="flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:opacity-90"
        >
          <Plus size={16} /> Novo lead
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total de leads" value={totalLeads} />
        <StatCard label="Novos esta semana" value={newThisWeek} />
        <StatCard label="Taxa de conversão" value={`${conversionRate}%`} />
        <StatCard label="Follow-ups atrasados" value={overdueCount} tone={overdueCount > 0 ? 'destructive' : undefined} />
      </div>

      <div className="mt-6">
        <LeadBoard leads={leads} staffOptions={staffOptionsList} />
      </div>
    </div>
  )
}

function StatCard({ label, value, tone }: { label: string; value: string | number; tone?: 'destructive' }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${tone === 'destructive' ? 'text-destructive' : 'text-foreground'}`}>{value}</p>
    </div>
  )
}
