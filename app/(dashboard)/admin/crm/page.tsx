import Link from 'next/link'
import { Plus } from 'lucide-react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { LeadBoard } from '@/components/admin/LeadBoard'
import { DEMO_LEADS, isDemoUser } from '@/lib/demo'

export default async function AdminCrmPage() {
  const session = await auth()
  const userId = session!.user.id

  const leads = isDemoUser(userId)
    ? DEMO_LEADS
    : await prisma.cRMLead.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, phone: true, source: true, status: true, priority: true, notes: true },
      })

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CRM — Leads</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Arraste os cartões entre colunas ou use o seletor de status.</p>
        </div>
        <Link
          href="/admin/crm/new"
          className="flex min-h-11 items-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white hover:bg-violet-700"
        >
          <Plus size={16} /> Novo lead
        </Link>
      </div>

      <div className="mt-6">
        <LeadBoard leads={leads} />
      </div>
    </div>
  )
}
