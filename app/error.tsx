'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Home, RotateCw } from 'lucide-react'
import { NotFoundScene } from '@/components/errors/NotFoundScene'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-card px-5 py-16 text-center text-foreground">
      <NotFoundScene />

      <p className="mt-8 text-sm font-bold uppercase tracking-[.2em] text-primary">Algo correu mal</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Ocorreu um erro inesperado.</h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        A nossa equipa já foi notificada. Pode tentar novamente ou voltar à página inicial.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => reset()}
          className="flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <RotateCw size={18} /> Tentar novamente
        </button>
        <Link
          href="/"
          className="flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
        >
          <Home size={18} /> Página inicial
        </Link>
      </div>
    </div>
  )
}
