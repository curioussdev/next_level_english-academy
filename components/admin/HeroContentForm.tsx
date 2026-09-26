'use client'

import { useActionState } from 'react'
import { saveHeroContent } from '@/lib/actions/admin/cms'
import { ErrorBanner, SubmitButton, TextField, TextAreaField } from '@/components/admin/cms/CmsFields'

interface HeroContentFormProps {
  eyebrow: string
  title: string
  subtitle: string
  statText: string
}

export function HeroContentForm({ eyebrow, title, subtitle, statText }: HeroContentFormProps) {
  const [state, formAction, pending] = useActionState(saveHeroContent, undefined)

  return (
    <form action={formAction} className="space-y-4 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border">
      <ErrorBanner message={state?.error} />
      <TextField label="Texto de destaque (badge)" name="eyebrow" defaultValue={eyebrow} />
      <TextAreaField label="Título principal" name="title" defaultValue={title} rows={2} />
      <TextAreaField label="Subtítulo" name="subtitle" defaultValue={subtitle} rows={3} />
      <TextField label="Texto de prova social" name="statText" defaultValue={statText} />
      <SubmitButton pending={pending} label="Guardar e publicar" pendingLabel="A guardar..." />
    </form>
  )
}
