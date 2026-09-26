import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export default function CheckoutSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-5">
      <div className="w-full max-w-sm rounded-3xl bg-card p-8 text-center shadow-sm ring-1 ring-border">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success/10 text-success">
          <CheckCircle2 size={28} />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-foreground">Pagamento confirmado!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          O seu acesso já está a ser ativado. Isto pode levar alguns instantes.
        </p>
        <Link
          href="/student"
          className="mt-6 flex min-h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white transition hover:opacity-90"
        >
          Ir para o dashboard
        </Link>
      </div>
    </div>
  )
}
