'use client'

import { useActionState } from 'react'
import { saveTestimonialsHeader } from '@/lib/actions/admin/cms'
import { ErrorBanner, SubmitButton, TextField } from '@/components/admin/cms/CmsFields'

interface TestimonialsHeaderFormProps {
  eyebrow: string
  heading: string
  ratingText: string
}

export function TestimonialsHeaderForm({ eyebrow, heading, ratingText }: TestimonialsHeaderFormProps) {
  const [state, formAction, pending] = useActionState(saveTestimonialsHeader, undefined)

  return (
    <form action={formAction} className="space-y-4 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border">
      <ErrorBanner message={state?.error} />
      <TextField label="Texto de destaque (eyebrow)" name="eyebrow" defaultValue={eyebrow} />
      <TextField label="Título da secção" name="heading" defaultValue={heading} />
      <TextField label="Texto de avaliação (junto às estrelas)" name="ratingText" defaultValue={ratingText} />
      <SubmitButton pending={pending} label="Guardar e publicar" pendingLabel="A guardar..." />
    </form>
  )
}
