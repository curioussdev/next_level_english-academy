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
    <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-warning">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <code className="flex-1 rounded-lg bg-card px-3 py-2 font-mono text-sm text-foreground ring-1 ring-warning/30">{value}</code>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copiar"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-warning/10 text-warning transition hover:bg-warning/20"
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>
      </div>
      <p className="mt-2 text-xs text-warning">Guarde-a agora — não voltará a ser mostrada.</p>
    </div>
  )
}
