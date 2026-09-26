import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export function BackToHome() {
  return (
    <Link
      href="/"
      className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
    >
      <ArrowLeft size={16} /> Voltar ao site
    </Link>
  )
}
