'use client'

import { useMemo, useState, useTransition } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Clock, Search, Tag, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { bulkAddTag, bulkAssignLeads, bulkDeleteLeads, bulkUpdateLeadStatus, deleteLead, updateLeadStatus } from '@/lib/actions/admin/crm'
import { LeadDetailPanel } from '@/components/admin/LeadDetailPanel'
import { LEAD_STATUS_LABELS, LEAD_STATUSES } from '@/lib/constants/crm'

export interface StaffOption {
  id: string
  name: string
}

export interface Lead {
  id: string
  name: string
  email: string
  phone: string | null
  source: string | null
  status: 'NEW' | 'CONTACTED' | 'INTERESTED' | 'FOLLOW_UP' | 'ENROLLED' | 'LOST'
  priority: string
  notes: string | null
  tags: string[]
  assignedTo: string | null
  nextFollowUp: Date | null
  lastContactDate: Date | null
  createdAt: Date
  userId: string | null
}

const COLUMN_STYLES: Record<Lead['status'], { color: string; dot: string }> = {
  NEW: { color: 'border-t-blue-500', dot: 'bg-blue-500' },
  CONTACTED: { color: 'border-t-warning', dot: 'bg-warning' },
  INTERESTED: { color: 'border-t-violet-500', dot: 'bg-violet-500' },
  FOLLOW_UP: { color: 'border-t-orange-500', dot: 'bg-orange-500' },
  ENROLLED: { color: 'border-t-success', dot: 'bg-success' },
  LOST: { color: 'border-t-muted-foreground', dot: 'bg-muted-foreground' },
}

export const COLUMNS = LEAD_STATUSES.map((status) => ({ status, title: LEAD_STATUS_LABELS[status], ...COLUMN_STYLES[status] }))

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function isOverdue(lead: Lead) {
  return !!lead.nextFollowUp && lead.nextFollowUp.getTime() < Date.now() && lead.status !== 'ENROLLED' && lead.status !== 'LOST'
}

export function LeadBoard({ leads: initialLeads, staffOptions }: { leads: Lead[]; staffOptions: StaffOption[] }) {
  const [leads, setLeads] = useState(initialLeads)
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [assigneeFilter, setAssigneeFilter] = useState('ALL')
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [, startTransition] = useTransition()

  const staffById = useMemo(() => Object.fromEntries(staffOptions.map((s) => [s.id, s.name])), [staffOptions])

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase()
    return leads.filter((lead) => {
      if (q && !lead.name.toLowerCase().includes(q) && !lead.email.toLowerCase().includes(q)) return false
      if (priorityFilter !== 'ALL' && lead.priority !== priorityFilter) return false
      if (assigneeFilter === 'UNASSIGNED' && lead.assignedTo) return false
      if (assigneeFilter !== 'ALL' && assigneeFilter !== 'UNASSIGNED' && lead.assignedTo !== assigneeFilter) return false
      return true
    })
  }, [leads, search, priorityFilter, assigneeFilter])

  const activeLead = leads.find((l) => l.id === activeLeadId) ?? null

  function moveLead(leadId: string, status: Lead['status']) {
    setLeads((prev) => prev.map((lead) => (lead.id === leadId ? { ...lead, status, lastContactDate: new Date() } : lead)))
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
    if (activeLeadId === leadId) setActiveLeadId(null)
    setSelectedIds((prev) => {
      if (!prev.has(leadId)) return prev
      const next = new Set(prev)
      next.delete(leadId)
      return next
    })
    startTransition(async () => {
      try {
        await deleteLead(leadId)
        toast.success('Lead apagado.')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Não foi possível apagar o lead.')
      }
    })
  }

  function applyLeadUpdate(leadId: string, patch: Partial<Lead>) {
    setLeads((prev) => prev.map((lead) => (lead.id === leadId ? { ...lead, ...patch } : lead)))
  }

  function toggleSelect(leadId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(leadId)) next.delete(leadId)
      else next.add(leadId)
      return next
    })
  }

  function clearSelection() {
    setSelectedIds(new Set())
  }

  function runBulkStatus(status: Lead['status']) {
    const ids = Array.from(selectedIds)
    setLeads((prev) => prev.map((lead) => (ids.includes(lead.id) ? { ...lead, status, lastContactDate: new Date() } : lead)))
    clearSelection()
    startTransition(async () => {
      try {
        await bulkUpdateLeadStatus(ids, status)
        toast.success(`${ids.length} lead(s) movido(s).`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Não foi possível mover os leads selecionados.')
      }
    })
  }

  function runBulkAssign(assignedTo: string) {
    const ids = Array.from(selectedIds)
    const value = assignedTo || null
    setLeads((prev) => prev.map((lead) => (ids.includes(lead.id) ? { ...lead, assignedTo: value } : lead)))
    clearSelection()
    startTransition(async () => {
      try {
        await bulkAssignLeads(ids, value)
        toast.success(`${ids.length} lead(s) reatribuído(s).`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Não foi possível reatribuir os leads selecionados.')
      }
    })
  }

  function runBulkTag(tag: string) {
    const trimmed = tag.trim()
    if (!trimmed) return
    const ids = Array.from(selectedIds)
    setLeads((prev) => prev.map((lead) => (ids.includes(lead.id) && !lead.tags.includes(trimmed) ? { ...lead, tags: [...lead.tags, trimmed] } : lead)))
    clearSelection()
    startTransition(async () => {
      try {
        await bulkAddTag(ids, trimmed)
        toast.success(`Tag "${trimmed}" adicionada a ${ids.length} lead(s).`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Não foi possível adicionar a tag.')
      }
    })
  }

  function runBulkDelete() {
    const ids = Array.from(selectedIds)
    if (!confirm(`Apagar ${ids.length} lead(s) selecionado(s)? Esta ação não pode ser desfeita.`)) return
    setLeads((prev) => prev.filter((lead) => !ids.includes(lead.id)))
    clearSelection()
    startTransition(async () => {
      try {
        await bulkDeleteLeads(ids)
        toast.success(`${ids.length} lead(s) apagado(s).`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Não foi possível apagar os leads selecionados.')
      }
    })
  }

  const hasActiveFilters = search.trim() !== '' || priorityFilter !== 'ALL' || assigneeFilter !== 'ALL'

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por nome ou email..."
            className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
        >
          <option value="ALL">Todas as prioridades</option>
          <option value="HIGH">Alta</option>
          <option value="MEDIUM">Média</option>
          <option value="LOW">Baixa</option>
        </select>
        <select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
        >
          <option value="ALL">Todos os responsáveis</option>
          <option value="UNASSIGNED">Sem responsável</option>
          {staffOptions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setSearch('')
              setPriorityFilter('ALL')
              setAssigneeFilter('ALL')
            }}
            className="flex h-10 items-center gap-1 rounded-xl px-3 text-sm font-medium text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
          >
            <X size={14} /> Limpar
          </button>
        )}
      </div>

      <div className="mt-4 flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((column) => {
          const columnLeads = filteredLeads.filter((lead) => lead.status === column.status)
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
              <div className={`flex items-center gap-2 rounded-t-xl border-t-2 bg-muted/60 px-3 py-2.5 ${column.color}`}>
                <span className={`h-2 w-2 rounded-full ${column.dot}`} />
                <h3 className="text-sm font-bold text-foreground">{column.title}</h3>
                <span className="ml-auto text-xs font-semibold text-muted-foreground">{columnLeads.length}</span>
              </div>
              <div className="min-h-24 space-y-2 rounded-b-xl bg-muted/30 p-2">
                {columnLeads.length === 0 && (
                  <div className="grid min-h-20 place-items-center rounded-xl border border-dashed border-border text-xs text-muted-foreground">
                    Sem leads aqui
                  </div>
                )}
                {columnLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    assignedName={lead.assignedTo ? staffById[lead.assignedTo] : undefined}
                    selected={selectedIds.has(lead.id)}
                    onToggleSelect={() => toggleSelect(lead.id)}
                    onMove={moveLead}
                    onDelete={removeLead}
                    onOpen={() => setActiveLeadId(lead.id)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {selectedIds.size > 0 && (
        <BulkActionBar
          count={selectedIds.size}
          staffOptions={staffOptions}
          onStatus={runBulkStatus}
          onAssign={runBulkAssign}
          onTag={runBulkTag}
          onDelete={runBulkDelete}
          onCancel={clearSelection}
        />
      )}

      <AnimatePresence>
        {activeLead && (
          <LeadDetailPanel
            key={activeLead.id}
            lead={activeLead}
            staffOptions={staffOptions}
            onClose={() => setActiveLeadId(null)}
            onSaved={(patch) => applyLeadUpdate(activeLead.id, patch)}
            onDelete={() => removeLead(activeLead.id)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function BulkActionBar({
  count,
  staffOptions,
  onStatus,
  onAssign,
  onTag,
  onDelete,
  onCancel,
}: {
  count: number
  staffOptions: StaffOption[]
  onStatus: (status: Lead['status']) => void
  onAssign: (assignedTo: string) => void
  onTag: (tag: string) => void
  onDelete: () => void
  onCancel: () => void
}) {
  const [tagInput, setTagInput] = useState('')

  return (
    <div className="sticky bottom-4 z-30 mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3 shadow-xl">
      <span className="pl-1 text-sm font-semibold text-foreground">{count} selecionado(s)</span>

      <select
        defaultValue=""
        onChange={(e) => {
          if (e.target.value) onStatus(e.target.value as Lead['status'])
          e.target.value = ''
        }}
        className="h-9 rounded-lg border border-border bg-card px-2 text-xs text-foreground outline-none focus:border-primary"
      >
        <option value="" disabled>
          Mudar fase...
        </option>
        {COLUMNS.map((c) => (
          <option key={c.status} value={c.status}>
            {c.title}
          </option>
        ))}
      </select>

      <select
        defaultValue=""
        onChange={(e) => {
          onAssign(e.target.value)
          e.target.value = ''
        }}
        className="h-9 rounded-lg border border-border bg-card px-2 text-xs text-foreground outline-none focus:border-primary"
      >
        <option value="" disabled>
          Atribuir a...
        </option>
        <option value="">Sem responsável</option>
        {staffOptions.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          onTag(tagInput)
          setTagInput('')
        }}
        className="flex items-center gap-1"
      >
        <input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          placeholder="Adicionar tag..."
          className="h-9 w-32 rounded-lg border border-border bg-card px-2 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
        />
        <button type="submit" className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-foreground/5 hover:text-foreground" aria-label="Adicionar tag">
          <Tag size={14} />
        </button>
      </form>

      <button
        type="button"
        onClick={onDelete}
        className="flex h-9 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-destructive hover:bg-destructive/10"
      >
        <Trash2 size={14} /> Apagar
      </button>

      <button type="button" onClick={onCancel} className="ml-auto flex h-9 items-center gap-1 rounded-lg px-2 text-xs font-medium text-muted-foreground hover:bg-foreground/5">
        <X size={14} /> Cancelar
      </button>
    </div>
  )
}

function LeadCard({
  lead,
  assignedName,
  selected,
  onToggleSelect,
  onMove,
  onDelete,
  onOpen,
}: {
  lead: Lead
  assignedName?: string
  selected: boolean
  onToggleSelect: () => void
  onMove: (leadId: string, status: Lead['status']) => void
  onDelete: (leadId: string) => void
  onOpen: () => void
}) {
  const priorityClass =
    lead.priority === 'HIGH' ? 'bg-destructive/10 text-destructive' : lead.priority === 'LOW' ? 'bg-muted text-muted-foreground' : 'bg-warning/10 text-warning'
  const overdue = isOverdue(lead)

  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/plain', lead.id)}
      onClick={onOpen}
      className={`cursor-grab space-y-2 rounded-2xl bg-card p-3 shadow-sm ring-1 transition hover:ring-primary/40 active:cursor-grabbing ${selected ? 'ring-2 ring-primary' : 'ring-border'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <input
            type="checkbox"
            checked={selected}
            onClick={(e) => e.stopPropagation()}
            onChange={onToggleSelect}
            className="h-4 w-4 shrink-0 rounded border-border accent-primary"
            aria-label={`Selecionar ${lead.name}`}
          />
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-400 to-blue-400 text-[11px] font-bold text-white">
            {initials(lead.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{lead.name}</p>
            <p className="truncate text-xs text-muted-foreground">{lead.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            if (confirm(`Apagar o lead "${lead.name}"?`)) onDelete(lead.id)
          }}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-foreground hover:bg-destructive/10 hover:text-destructive"
          aria-label="Apagar lead"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${priorityClass}`}>{lead.priority}</span>
        {lead.source && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{lead.source}</span>}
        {lead.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            {tag}
          </span>
        ))}
      </div>

      {lead.notes && <p className="line-clamp-2 text-xs text-muted-foreground">{lead.notes}</p>}

      {lead.nextFollowUp && (
        <div className={`flex items-center gap-1 text-[11px] font-medium ${overdue ? 'text-destructive' : 'text-muted-foreground'}`}>
          <Clock size={12} />
          {overdue ? 'Follow-up atrasado' : 'Follow-up'}: {lead.nextFollowUp.toLocaleDateString('pt-PT')}
        </div>
      )}

      {assignedName && (
        <p className="truncate text-[11px] text-muted-foreground">
          Responsável: <span className="font-medium text-foreground">{assignedName}</span>
        </p>
      )}

      {lead.userId && <p className="text-[11px] font-medium text-success">Convertido em aluno</p>}

      <select
        value={lead.status}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => onMove(lead.id, e.target.value as Lead['status'])}
        className="h-8 w-full rounded-lg border border-border bg-card px-2 text-xs text-foreground outline-none focus:border-primary"
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
