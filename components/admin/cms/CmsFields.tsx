import { ICON_KEYS } from '@/lib/landing-icons'

const inputClassName =
  'mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20'
const textareaClassName =
  'mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20'

export function TextField({ label, name, defaultValue }: { label: string; name: string; defaultValue: string }) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <input id={name} name={name} defaultValue={defaultValue} required className={inputClassName} />
    </div>
  )
}

export function TextAreaField({
  label,
  name,
  defaultValue,
  rows = 3,
}: {
  label: string
  name: string
  defaultValue: string
  rows?: number
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <textarea id={name} name={name} rows={rows} defaultValue={defaultValue} required className={textareaClassName} />
    </div>
  )
}

export function IconSelectField({ label, name, defaultValue }: { label: string; name: string; defaultValue: string }) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <select id={name} name={name} defaultValue={defaultValue} className={inputClassName}>
        {ICON_KEYS.map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
    </div>
  )
}

export function SubmitButton({ pending, label, pendingLabel }: { pending: boolean; label: string; pendingLabel: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  )
}

export function ErrorBanner({ message }: { message?: string }) {
  if (!message) return null
  return <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{message}</p>
}
