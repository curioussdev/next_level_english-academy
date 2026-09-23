'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { createStudent } from '@/lib/actions/admin/users'
import { CopyableSecret } from '@/components/shared/CopyableSecret'

export default function NewStudentPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ userId: string; tempPassword: string } | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      try {
        const created = await createStudent({ name, email })
        setResult(created)
        toast.success('Aluno criado com sucesso.')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Não foi possível criar o aluno.')
      }
    })
  }

  if (result) {
    return (
      <div className="mx-auto max-w-lg">
        <h1 className="text-3xl font-bold tracking-tight">Aluno criado</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Partilhe estas credenciais com {name} para o primeiro acesso. A senha deve ser alterada após o login.
        </p>

        <div className="mt-6 space-y-4 rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email</p>
            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{email}</p>
          </div>
          <CopyableSecret label="Senha temporária" value={result.tempPassword} />
        </div>

        <div className="mt-6 flex gap-3">
          <Link
            href={`/admin/students/${result.userId}`}
            className="flex-1 rounded-xl bg-violet-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            Ver perfil do aluno
          </Link>
          <button
            type="button"
            onClick={() => {
              setResult(null)
              setName('')
              setEmail('')
            }}
            className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-200"
          >
            Criar outro aluno
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg">
      <Link href="/admin/students" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900">
        <ArrowLeft size={16} /> Alunos
      </Link>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">Novo aluno</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">Cria a conta e gera uma senha temporária para o primeiro acesso.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
        <div>
          <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Nome
          </label>
          <input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="h-11 w-full rounded-xl bg-violet-600 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
        >
          {isPending ? 'A criar...' : 'Criar aluno'}
        </button>
      </form>
    </div>
  )
}
