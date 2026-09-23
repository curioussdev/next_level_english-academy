'use client'

import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteLead, updateLeadStatus } from '@/lib/actions/admin/crm'

export interface Lead {
  id: string
  name: string
  email: string
  phone: string | null
  source: string | null
  status: 'NEW' | 'CONTACTED' | 'INTERESTED' | 'FOLLOW_UP' | 'ENROLLED' | 'LOST'
  priority: string
  notes: string | null
}

const COLUMNS: { status: Lead['status']; title: string; color: string }[] = [
  { status: 'NEW', title: 'Novos', color: 'bg-blue-500' },
  { status: 'CONTACTED', title: 'Contactados', color: 'bg-amber-500' },
  { status: 'INTERESTED', title: 'Interessados', color: 'bg-violet-500' },
  { status: 'FOLLOW_UP', title: 'Follow-up', color: 'bg-orange-500' },
  { status: 'ENROLLED', title: 'Matriculados', color: 'bg-teal-500' },
  { status: 'LOST', title: 'Perdidos', color: 'bg-slate-400' },
]

export function LeadBoard({ leads: initialLeads }: { leads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads)
  const [, startTransition] = useTransition()

  function moveLead(leadId: string, status: Lead['status']) {
    setLeads((prev) => prev.map((lead) => (lead.id === leadId ? { ...lead, status } : lead)))
    startTransition(async () => {
      try {
        await updateLeadStatus(leadId, status)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Não foi possível mover o lead.')
      }
    })
  }

  function removeLead(leadId: string) {
    setLeads((prev) => prev.filter((lead) => lead.id !== leadId))
    startTransition(async () => {
      try {
        await deleteLead(leadId)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Não foi possível apagar o lead.')
      }
    })
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((column) => {
        const columnLeads = leads.filter((lead) => lead.status === column.status)
        return (
          <div
            key={column.status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const leadId = e.dataTransfer.getData('text/plain')
              if (leadId) moveLead(leadId, column.status)
            }}
            className="w-72 shrink-0"
          >
            <div className="flex items-center gap-2 px-1">
              <span className={`h-2 w-2 rounded-full ${column.color}`} />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">{column.title}</h3>
              <span className="text-xs text-slate-400">{columnLeads.length}</span>
            </div>
            <div className="mt-3 min-h-16 space-y-2 rounded-2xl bg-slate-100/60 p-2">
              {columnLeads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} onMove={moveLead} onDelete={removeLead} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function LeadCard({
  lead,
  onMove,
  onDelete,
}: {
  lead: Lead
  onMove: (leadId: string, status: Lead['status']) => void
  onDelete: (leadId: string) => void
}) {
  const priorityClass =
    lead.priority === 'HIGH' ? 'bg-red-50 dark:bg-red-500/10 text-red-600' : lead.priority === 'LOW' ? 'bg-slate-100 text-slate-500' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700'

  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/plain', lead.id)}
      className="cursor-grab space-y-2 rounded-2xl bg-white dark:bg-slate-900 p-3 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800 active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{lead.name}</p>
          <p className="truncate text-xs text-slate-400">{lead.email}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (confirm(`Apagar o lead "${lead.name}"?`)) onDelete(lead.id)
          }}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-600"
          aria-label="Apagar lead"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${priorityClass}`}>{lead.priority}</span>
        {lead.source && <span className="rounded-full bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">{lead.source}</span>}
      </div>

      {lead.notes && <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{lead.notes}</p>}

      <select
        value={lead.status}
        onChange={(e) => onMove(lead.id, e.target.value as Lead['status'])}
        className="h-8 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-violet-500"
      >
        {COLUMNS.map((column) => (
          <option key={column.status} value={column.status}>
            {column.title}
          </option>
        ))}
      </select>
    </div>
  )
}
