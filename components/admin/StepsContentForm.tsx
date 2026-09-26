'use client'

import { useActionState } from 'react'
import { saveStepsContent } from '@/lib/actions/admin/cms'
import { ErrorBanner, SubmitButton, TextField, TextAreaField } from '@/components/admin/cms/CmsFields'
import type { StepItem } from '@/lib/cms'

interface StepsContentFormProps {
  eyebrow: string
  heading: string
  items: StepItem[]
}

export function StepsContentForm({ eyebrow, heading, items }: StepsContentFormProps) {
  const [state, formAction, pending] = useActionState(saveStepsContent, undefined)

  return (
    <form action={formAction} className="space-y-4 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border">
      <ErrorBanner message={state?.error} />
      <TextField label="Texto de destaque (eyebrow)" name="eyebrow" defaultValue={eyebrow} />
      <TextField label="Título da secção" name="heading" defaultValue={heading} />

      <div className="border-t border-border pt-4">
        <p className="text-sm font-semibold text-foreground">Passos (4, numerados automaticamente)</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {items.map((item, i) => (
            <div key={i} className="space-y-3 rounded-2xl border border-border p-4">
              <p className="text-xs font-semibold text-muted-foreground">Passo {String(i + 1).padStart(2, '0')}</p>
              <TextField label="Título" name={`item${i}Title`} defaultValue={item.title} />
              <TextAreaField label="Texto" name={`item${i}Text`} defaultValue={item.text} rows={2} />
            </div>
          ))}
        </div>
      </div>

      <SubmitButton pending={pending} label="Guardar e publicar" pendingLabel="A guardar..." />
    </form>
  )
}
