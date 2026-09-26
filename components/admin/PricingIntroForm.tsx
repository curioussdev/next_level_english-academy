'use client'

import { useActionState } from 'react'
import { savePricingIntro } from '@/lib/actions/admin/cms'
import { ErrorBanner, SubmitButton, TextField, TextAreaField } from '@/components/admin/cms/CmsFields'

interface PricingIntroFormProps {
  eyebrow: string
  heading: string
  subtitle: string
}

export function PricingIntroForm({ eyebrow, heading, subtitle }: PricingIntroFormProps) {
  const [state, formAction, pending] = useActionState(savePricingIntro, undefined)

  return (
    <form action={formAction} className="space-y-4 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border">
      <ErrorBanner message={state?.error} />
      <TextField label="Texto de destaque (eyebrow)" name="eyebrow" defaultValue={eyebrow} />
      <TextField label="Título da secção" name="heading" defaultValue={heading} />
      <TextAreaField label="Subtítulo" name="subtitle" defaultValue={subtitle} rows={2} />
      <SubmitButton pending={pending} label="Guardar e publicar" pendingLabel="A guardar..." />
    </form>
  )
}
