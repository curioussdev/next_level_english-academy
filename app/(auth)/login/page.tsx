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
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-5 py-10">
      <div className="flex w-full max-w-sm items-center justify-between">
        <BackToHome />
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Entrar</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Continue a sua evolução no inglês.</p>

        {justRegistered && (
          <p className="mt-4 rounded-lg bg-teal-50 dark:bg-teal-500/10 px-3 py-2 text-sm text-teal-700 dark:text-teal-300">Conta criada! Já pode entrar.</p>
        )}

        {process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && (
          <div className="mt-4 rounded-lg bg-violet-50 dark:bg-violet-500/10 px-3 py-2 text-xs text-violet-700 dark:text-violet-300">
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
            <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email.message}</p>}
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Palavra-passe
              </label>
              <Link href="/forgot-password" className="text-xs font-medium text-violet-600 dark:text-violet-400">
                Esqueceu a senha?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              {...register('password')}
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
            {errors.password && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.password.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full rounded-xl bg-violet-600 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            {isSubmitting ? 'A entrar...' : 'Entrar'}
          </button>
        </form>

        {/* Login com Google fica desativado até GOOGLE_CLIENT_ID/SECRET estarem configurados — ver lib/auth.ts */}

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Não tem conta?{' '}
          <Link href="/register" className="font-semibold text-violet-600 dark:text-violet-400">
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
