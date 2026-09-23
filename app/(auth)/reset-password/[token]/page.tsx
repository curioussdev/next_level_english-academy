'use client'

import { Suspense, use, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { BackToHome } from '@/components/layout/BackToHome'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { resetPassword } from '@/lib/actions/password-reset'
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validators/auth'

function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) })

  async function onSubmit(data: ResetPasswordInput) {
    if (!email) {
      toast.error('Link inválido — falta o email. Peça um novo link.')
      return
    }
    const result = await resetPassword(email, token, data)
    if (result && 'error' in result) {
      toast.error(result.error)
      return
    }
    setDone(true)
    toast.success('Palavra-passe atualizada!')
    setTimeout(() => router.push('/login'), 1500)
  }

  if (done) {
    return <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Palavra-passe atualizada. A redirecionar para o login...</p>
  }

  return (
    <>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Escolha uma nova palavra-passe para {email || 'a sua conta'}.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Nova palavra-passe
          </label>
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
          {isSubmitting ? 'A guardar...' : 'Guardar nova palavra-passe'}
        </button>
      </form>
    </>
  )
}

export default function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-5 py-10">
      <div className="flex w-full max-w-sm items-center justify-between">
        <BackToHome />
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Nova palavra-passe</h1>
        <Suspense>
          <ResetPasswordForm token={token} />
        </Suspense>
        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          <Link href="/login" className="font-semibold text-violet-600 dark:text-violet-400">
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  )
}
