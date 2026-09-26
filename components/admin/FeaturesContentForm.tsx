'use client'

import { useActionState } from 'react'
import { saveFeaturesContent } from '@/lib/actions/admin/cms'
import { ErrorBanner, SubmitButton, TextField, TextAreaField, IconSelectField } from '@/components/admin/cms/CmsFields'
import type { FeatureItem } from '@/lib/cms'

interface FeaturesContentFormProps {
  eyebrow: string
  headingMain: string
  headingHighlight: string
  paragraph: string
  calloutTitle: string
  calloutText: string
  items: FeatureItem[]
}

export function FeaturesContentForm({
  eyebrow,
  headingMain,
  headingHighlight,
  paragraph,
  calloutTitle,
  calloutText,
  items,
}: FeaturesContentFormProps) {
  const [state, formAction, pending] = useActionState(saveFeaturesContent, undefined)

  return (
    <form action={formAction} className="space-y-4 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border">
      <ErrorBanner message={state?.error} />
      <TextField label="Texto de destaque (eyebrow)" name="eyebrow" defaultValue={eyebrow} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Título (parte normal)" name="headingMain" defaultValue={headingMain} />
        <TextField label="Título (parte destacada)" name="headingHighlight" defaultValue={headingHighlight} />
      </div>
      <TextAreaField label="Parágrafo introdutório" name="paragraph" defaultValue={paragraph} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Título do destaque (callout)" name="calloutTitle" defaultValue={calloutTitle} />
        <TextField label="Texto do destaque (callout)" name="calloutText" defaultValue={calloutText} />
      </div>

      <div className="border-t border-border pt-4">
        <p className="text-sm font-semibold text-foreground">Cartões de destaque (4)</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {items.map((item, i) => (
            <div key={i} className="space-y-3 rounded-2xl border border-border p-4">
              <IconSelectField label={`Ícone ${i + 1}`} name={`item${i}Icon`} defaultValue={item.icon} />
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
