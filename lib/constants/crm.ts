import type { LeadStatus } from '@prisma/client'

/** Ordem das fases do funil — usada pelas colunas do board e por qualquer lógica que precise percorrer as fases em sequência. */
export const LEAD_STATUSES: LeadStatus[] = ['NEW', 'CONTACTED', 'INTERESTED', 'FOLLOW_UP', 'ENROLLED', 'LOST']

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: 'Novos',
  CONTACTED: 'Contactados',
  INTERESTED: 'Interessados',
  FOLLOW_UP: 'Follow-up',
  ENROLLED: 'Matriculados',
  LOST: 'Perdidos',
}
