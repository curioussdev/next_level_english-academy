import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export default function CheckoutSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-teal-50 text-teal-600">
          <CheckCircle2 size={28} />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-900">Pagamento confirmado!</h1>
        <p className="mt-2 text-sm text-slate-500">
          O seu acesso já está a ser ativado. Isto pode levar alguns instantes.
        </p>
        <Link
          href="/student"
          className="mt-6 flex min-h-11 w-full items-center justify-center rounded-xl bg-violet-600 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          Ir para o dashboard
        </Link>
      </div>
    </div>
  )
}
