'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

/** Mostra um valor sensível (ex.: senha temporária) com botão de copiar. Pensado para ser visto uma única vez. */
export function CopyableSecret({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API pode falhar (permissões, contexto não seguro) — sem isso, o valor continua visível para copiar à mão.
    }
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-500/10 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <code className="flex-1 rounded-lg bg-white dark:bg-slate-900 px-3 py-2 font-mono text-sm text-slate-900 dark:text-white ring-1 ring-amber-200">{value}</code>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copiar"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-700 dark:text-amber-300 transition hover:bg-amber-200"
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>
      </div>
      <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">Guarde-a agora — não voltará a ser mostrada.</p>
    </div>
  )
}
