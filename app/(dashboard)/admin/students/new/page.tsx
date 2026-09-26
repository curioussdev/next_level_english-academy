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
        <p className="mt-2 text-muted-foreground">
          Partilhe estas credenciais com {name} para o primeiro acesso. A senha deve ser alterada após o login.
        </p>

        <div className="mt-6 space-y-4 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</p>
            <p className="mt-1 text-sm font-medium text-foreground">{email}</p>
          </div>
          <CopyableSecret label="Senha temporária" value={result.tempPassword} />
        </div>

        <div className="mt-6 flex gap-3">
          <Link
            href={`/admin/students/${result.userId}`}
            className="flex-1 rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white transition hover:opacity-90"
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
            className="flex-1 rounded-xl bg-muted px-4 py-3 text-sm font-semibold text-foreground transition hover:opacity-80"
          >
            Criar outro aluno
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg">
      <Link href="/admin/students" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft size={16} /> Alunos
      </Link>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">Novo aluno</h1>
      <p className="mt-2 text-muted-foreground">Cria a conta e gera uma senha temporária para o primeiro acesso.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border">
        <div>
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Nome
          </label>
          <input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="h-11 w-full rounded-xl bg-primary text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? 'A criar...' : 'Criar aluno'}
        </button>
      </form>
    </div>
  )
}
