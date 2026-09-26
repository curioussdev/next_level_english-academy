'use client'

import { useActionState } from 'react'
import { saveFooterContent } from '@/lib/actions/admin/cms'
import { ErrorBanner, SubmitButton, TextField } from '@/components/admin/cms/CmsFields'

export function FooterContentForm({ copyrightText }: { copyrightText: string }) {
  const [state, formAction, pending] = useActionState(saveFooterContent, undefined)

  return (
    <form action={formAction} className="space-y-4 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border">
      <ErrorBanner message={state?.error} />
      <TextField label="Texto de copyright" name="copyrightText" defaultValue={copyrightText} />
      <SubmitButton pending={pending} label="Guardar e publicar" pendingLabel="A guardar..." />
    </form>
  )
}
