'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { toast } from 'sonner'
import { registerUser } from '@/lib/actions/auth'
import { registerSchema, type RegisterInput } from '@/lib/validators/auth'
import { BackToHome } from '@/components/layout/BackToHome'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  async function onSubmit(data: RegisterInput) {
    const result = await registerUser(data)
    if (result?.error) {
      toast.error(result.error)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-10">
      <div className="flex w-full max-w-sm items-center justify-between">
        <BackToHome />
        <ThemeToggle />
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm rounded-3xl bg-card p-8 shadow-sm ring-1 ring-border"
      >
        <h1 className="text-2xl font-bold text-foreground">Criar conta</h1>
        <p className="mt-1 text-sm text-muted-foreground">Comece a evoluir o seu inglês hoje.</p>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="text-sm font-medium text-foreground">
              Nome
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Palavra-passe
            </label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 h-11 w-full rounded-xl bg-primary text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting ? 'A criar conta...' : 'Criar conta'}
        </button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Já tem conta?{' '}
          <Link href="/login" className="font-semibold text-primary">
            Entrar
          </Link>
        </p>
      </form>
    </div>
  )
}
