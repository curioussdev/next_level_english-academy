import Link from 'next/link'
import { XCircle } from 'lucide-react'

export default function CheckoutCancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-5">
      <div className="w-full max-w-sm rounded-3xl bg-card p-8 text-center shadow-sm ring-1 ring-border">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-muted text-muted-foreground">
          <XCircle size={28} />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-foreground">Pagamento cancelado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Não se preocupe, não foi feita nenhuma cobrança.</p>
        <Link
          href="/#planos"
          className="mt-6 flex min-h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white transition hover:opacity-90"
        >
          Ver planos novamente
        </Link>
      </div>
    </div>
  )
}
