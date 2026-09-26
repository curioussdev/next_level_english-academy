'use client'

import { useActionState, useEffect, useRef, useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Trash2, UserPlus, X } from 'lucide-react'
import { toast } from 'sonner'
import { addLeadActivity, convertLeadToStudent, getLeadActivities, updateLead, updateLeadStatus } from '@/lib/actions/admin/crm'
import { COLUMNS, type Lead, type StaffOption } from '@/components/admin/LeadBoard'
import { LEAD_STATUS_LABELS } from '@/lib/constants/crm'

const fieldClassName =
  'mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20'

type LeadActivity = Awaited<ReturnType<typeof getLeadActivities>>[number]

function formatActivity(log: LeadActivity): string {
  const metadata = log.metadata ?? {}
  switch (log.action) {
    case 'LEAD_NOTE_ADDED':
      return typeof metadata.content === 'string' ? metadata.content : 'Nota adicionada.'
    case 'LEAD_STATUS_CHANGED': {
      const from = metadata.from as Lead['status'] | undefined
      const to = metadata.to as Lead['status'] | undefined
      const fromLabel = from ? LEAD_STATUS_LABELS[from] : undefined
      const toLabel = to ? LEAD_STATUS_LABELS[to] : undefined
      return `Fase alterada${fromLabel ? ` de "${fromLabel}"` : ''}${toLabel ? ` para "${toLabel}"` : ''}.`
    }
    case 'LEAD_CONVERTED':
      return metadata.existingAccount ? 'Associado a uma conta de aluno já existente.' : 'Conta de aluno criada automaticamente.'
    default:
      return log.action
  }
}

interface LeadDetailPanelProps {
  lead: Lead
  staffOptions: StaffOption[]
  onClose: () => void
  onSaved: (patch: Partial<Lead>) => void
  onDelete: () => void
}

export function LeadDetailPanel({ lead, staffOptions, onClose, onSaved, onDelete }: LeadDetailPanelProps) {
  const [name, setName] = useState(lead.name)
  const [email, setEmail] = useState(lead.email)
  const [phone, setPhone] = useState(lead.phone ?? '')
  const [source, setSource] = useState(lead.source ?? '')
  const [priority, setPriority] = useState(lead.priority)
  const [notes, setNotes] = useState(lead.notes ?? '')
  const [tagsText, setTagsText] = useState(lead.tags.join(', '))
  const [assignedTo, setAssignedTo] = useState(lead.assignedTo ?? '')
  const [nextFollowUp, setNextFollowUp] = useState(lead.nextFollowUp ? lead.nextFollowUp.toISOString().slice(0, 10) : '')
  const [status, setStatus] = useState(lead.status)
  const [statusPending, startStatusTransition] = useTransition()
  const [convertPending, startConvertTransition] = useTransition()

  const [activities, setActivities] = useState<LeadActivity[]>([])
  const [activitiesLoading, setActivitiesLoading] = useState(true)
  const [noteText, setNoteText] = useState('')
  const [notePending, startNoteTransition] = useTransition()

  const [state, formAction, pending] = useActionState(updateLead.bind(null, lead.id), undefined)
  const wasPending = useRef(false)

  useEffect(() => {
    let cancelled = false
    setActivitiesLoading(true)
    getLeadActivities(lead.id)
      .then((result) => {
        if (!cancelled) setActivities(result)
      })
      .finally(() => {
        if (!cancelled) setActivitiesLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [lead.id])

  function handleConvert() {
    startConvertTransition(async () => {
      try {
        const result = await convertLeadToStudent(lead.id)
        onSaved({ userId: result.userId })
        toast.success(result.existingAccount ? 'Lead associado a uma conta de aluno existente.' : 'Conta de aluno criada e credenciais enviadas por email.')
        setActivities((prev) => [
          { id: `local-${Date.now()}`, action: 'LEAD_CONVERTED', metadata: { existingAccount: result.existingAccount }, createdAt: new Date(), authorName: 'Você' },
          ...prev,
        ])
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Não foi possível converter o lead.')
      }
    })
  }

  function handleAddNote() {
    const trimmed = noteText.trim()
    if (trimmed.length < 2) {
      toast.error('A nota precisa de pelo menos 2 caracteres.')
      return
    }
    startNoteTransition(async () => {
      try {
        await addLeadActivity(lead.id, trimmed)
        setActivities((prev) => [
          { id: `local-${Date.now()}`, action: 'LEAD_NOTE_ADDED', metadata: { content: trimmed }, createdAt: new Date(), authorName: 'Você' },
          ...prev,
        ])
        setNoteText('')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Não foi possível adicionar a nota.')
      }
    })
  }

  useEffect(() => {
    if (wasPending.current && !pending) {
      if (state?.error) {
        toast.error(state.error)
      } else {
        toast.success('Lead atualizado.')
        onSaved({
          name,
          email,
          phone: phone.trim() || null,
          source: source.trim() || null,
          priority,
          notes: notes.trim() || null,
          tags: tagsText
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          assignedTo: assignedTo || null,
          nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null,
        })
      }
    }
    wasPending.current = pending
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending])

  function handleStatusChange(next: Lead['status']) {
    setStatus(next)
    startStatusTransition(async () => {
      try {
        await updateLeadStatus(lead.id, next)
        onSaved({ status: next, lastContactDate: new Date() })
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Não foi possível mudar a fase.')
        setStatus(lead.status)
      }
    })
  }

  return (
    <>
      <motion.button
        type="button"
        aria-label="Fechar painel"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-slate-950/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-card shadow-2xl"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-lg font-bold text-foreground">Detalhes do lead</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-foreground/5 hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div>
            <label htmlFor="status" className="text-sm font-medium text-foreground">
              Fase
            </label>
            <select
              id="status"
              value={status}
              disabled={statusPending}
              onChange={(e) => handleStatusChange(e.target.value as Lead['status'])}
              className={fieldClassName}
            >
              {COLUMNS.map((c) => (
                <option key={c.status} value={c.status}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3">
            {lead.userId ? (
              <p className="flex items-center gap-2 rounded-xl bg-success/10 px-3 py-2 text-sm font-medium text-success">
                <CheckCircle2 size={16} /> Convertido em conta de aluno
              </p>
            ) : (
              <button
                type="button"
                onClick={handleConvert}
                disabled={convertPending}
                className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-primary/30 text-sm font-semibold text-primary transition hover:bg-primary/10 disabled:opacity-60"
              >
                <UserPlus size={16} /> {convertPending ? 'A converter...' : 'Converter em aluno agora'}
              </button>
            )}
          </div>

          <form action={formAction} className="mt-4 space-y-4">
            {state?.error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>}

            <div>
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                Nome
              </label>
              <input id="name" name="name" required value={name} onChange={(e) => setName(e.target.value)} className={fieldClassName} />
            </div>

            <div>
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <input id="email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClassName} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="text-sm font-medium text-foreground">
                  Telefone
                </label>
                <input id="phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={fieldClassName} />
              </div>
              <div>
                <label htmlFor="priority" className="text-sm font-medium text-foreground">
                  Prioridade
                </label>
                <select id="priority" name="priority" value={priority} onChange={(e) => setPriority(e.target.value)} className={fieldClassName}>
                  <option value="LOW">Baixa</option>
                  <option value="MEDIUM">Média</option>
                  <option value="HIGH">Alta</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="source" className="text-sm font-medium text-foreground">
                  Origem
                </label>
                <select id="source" name="source" value={source} onChange={(e) => setSource(e.target.value)} className={fieldClassName}>
                  <option value="">Não especificado</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Google">Google Ads</option>
                  <option value="Referral">Indicação</option>
                </select>
              </div>
              <div>
                <label htmlFor="assignedTo" className="text-sm font-medium text-foreground">
                  Responsável
                </label>
                <select id="assignedTo" name="assignedTo" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className={fieldClassName}>
                  <option value="">Sem responsável</option>
                  {staffOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="nextFollowUp" className="text-sm font-medium text-foreground">
                Próximo follow-up
              </label>
              <input
                id="nextFollowUp"
                name="nextFollowUp"
                type="date"
                value={nextFollowUp}
                onChange={(e) => setNextFollowUp(e.target.value)}
                className={fieldClassName}
              />
            </div>

            <div>
              <label htmlFor="tags" className="text-sm font-medium text-foreground">
                Tags (separadas por vírgula)
              </label>
              <input
                id="tags"
                name="tags"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="Ex.: Plano Pro, Urgente"
                className={fieldClassName}
              />
            </div>

            <div>
              <label htmlFor="notes" className="text-sm font-medium text-foreground">
                Notas
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {lead.lastContactDate && (
              <p className="text-xs text-muted-foreground">Último contacto: {lead.lastContactDate.toLocaleDateString('pt-PT')}</p>
            )}
            <p className="text-xs text-muted-foreground">Lead criado em {lead.createdAt.toLocaleDateString('pt-PT')}</p>

            <button
              type="submit"
              disabled={pending}
              className="flex min-h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {pending ? 'A guardar...' : 'Guardar alterações'}
            </button>
          </form>

          <div className="mt-6 border-t border-border pt-5">
            <p className="text-sm font-semibold text-foreground">Histórico</p>

            <div className="mt-3 flex items-start gap-2">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleAddNote()
                  }
                }}
                rows={2}
                placeholder="Registar um contacto, ligação ou nota..."
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={handleAddNote}
                disabled={notePending}
                className="flex h-11 shrink-0 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {notePending ? '...' : 'Registar'}
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {activitiesLoading && <p className="text-xs text-muted-foreground">A carregar histórico...</p>}
              {!activitiesLoading && activities.length === 0 && <p className="text-xs text-muted-foreground">Sem atividade registada ainda.</p>}
              {activities.map((log) => (
                <div key={log.id} className="rounded-xl bg-muted/40 p-3 text-sm">
                  <p className="text-foreground">{formatActivity(log)}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {log.authorName} · {log.createdAt.toLocaleString('pt-PT')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (confirm(`Apagar o lead "${lead.name}"?`)) {
                onDelete()
                onClose()
              }
            }}
            className="mt-6 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-destructive/20 text-sm font-semibold text-destructive transition hover:bg-destructive/10"
          >
            <Trash2 size={16} /> Apagar lead
          </button>
        </div>
      </motion.div>
    </>
  )
}
