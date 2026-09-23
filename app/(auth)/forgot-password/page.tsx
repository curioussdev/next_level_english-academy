import Link from 'next/link'

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100">
        <h1 className="text-2xl font-bold text-slate-900">Recuperar palavra-passe</h1>
        <p className="mt-2 text-sm text-slate-500">
          A recuperação por email chega em breve. Por agora, contacte o suporte para repor o acesso.
        </p>
        <Link
          href="/login"
          className="mt-6 flex min-h-11 w-full items-center justify-center rounded-xl bg-violet-600 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          Voltar ao login
        </Link>
      </div>
    </div>
  )
}
