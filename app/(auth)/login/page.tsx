'use client'

import { Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'
import Link from 'next/link'
import { loginSchema, type LoginInput } from '@/lib/validators/auth'

function LoginForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/student'
  const justRegistered = searchParams.get('registered') === 'true'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginInput) {
    const result = await signIn('credentials', { ...data, redirect: false, callbackUrl })

    if (result?.error) {
      toast.error('Email ou palavra-passe inválidos.')
      return
    }

    window.location.href = result?.url ?? callbackUrl
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        <h1 className="text-2xl font-bold text-slate-900">Entrar</h1>
        <p className="mt-1 text-sm text-slate-500">Continue a sua evolução no inglês.</p>

        {justRegistered && (
          <p className="mt-4 rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-700">Conta criada! Já pode entrar.</p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Palavra-passe
              </label>
              <Link href="/forgot-password" className="text-xs font-medium text-violet-600">
                Esqueceu a senha?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              {...register('password')}
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full rounded-xl bg-violet-600 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            {isSubmitting ? 'A entrar...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
          <div className="h-px flex-1 bg-slate-100" /> ou <div className="h-px flex-1 bg-slate-100" />
        </div>

        <button
          onClick={() => signIn('google', { callbackUrl })}
          className="mt-4 h-11 w-full rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Entrar com Google
        </button>

        <p className="mt-6 text-center text-sm text-slate-500">
          Não tem conta?{' '}
          <Link href="/register" className="font-semibold text-violet-600">
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
