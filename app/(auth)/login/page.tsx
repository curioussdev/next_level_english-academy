'use client'

import { Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams } from 'next/navigation'
import { signIn, getSession } from 'next-auth/react'
import { toast } from 'sonner'
import Link from 'next/link'
import { loginSchema, type LoginInput } from '@/lib/validators/auth'
import { BackToHome } from '@/components/layout/BackToHome'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

function LoginForm() {
  const searchParams = useSearchParams()
  const explicitCallbackUrl = searchParams.get('callbackUrl')
  const justRegistered = searchParams.get('registered') === 'true'
  const justBlocked = searchParams.get('blocked') === 'true'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginInput) {
    const result = await signIn('credentials', { ...data, redirect: false })

    if (result?.error) {
      toast.error('Email ou palavra-passe inválidos.')
      return
    }

    // Sem callbackUrl explícito (ex.: entrada direta em /login), o destino
    // depende do papel — nunca assumir /student para todos os papéis.
    const session = await getSession()
    const role = session?.user?.role
    const roleHome = role === 'STUDENT' || !role ? '/student' : '/admin'

    window.location.href = explicitCallbackUrl || roleHome
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-10">
      <div className="flex w-full max-w-sm items-center justify-between">
        <BackToHome />
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm rounded-3xl bg-card p-8 shadow-sm ring-1 ring-border">
        <h1 className="text-2xl font-bold text-foreground">Entrar</h1>
        <p className="mt-1 text-sm text-muted-foreground">Continue a sua evolução no inglês.</p>

        {justRegistered && (
          <p className="mt-4 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">Conta criada! Já pode entrar.</p>
        )}

        {justBlocked && (
          <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            A sua conta foi bloqueada. Contacte a administração se não estiver à espera disto.
          </p>
        )}

        {process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && (
          <div className="mt-4 rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary">
            <p className="font-semibold">Modo demo (sem banco conectado)</p>
            <p className="mt-1">
              aluno@nextlevel.pt · admin@nextlevel.pt · ralde@nextlevel.pt
              <br />
              senha: password123
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
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
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Palavra-passe
              </label>
              <Link href="/forgot-password" className="text-xs font-medium text-primary">
                Esqueceu a senha?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              {...register('password')}
              className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full rounded-xl bg-primary text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? 'A entrar...' : 'Entrar'}
          </button>
        </form>

        {/* Login com Google fica desativado até GOOGLE_CLIENT_ID/SECRET estarem configurados — ver lib/auth.ts */}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Não tem conta?{' '}
          <Link href="/register" className="font-semibold text-primary">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
