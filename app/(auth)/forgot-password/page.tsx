'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { toast } from 'sonner'
import { BackToHome } from '@/components/layout/BackToHome'
import { requestPasswordReset } from '@/lib/actions/password-reset'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validators/auth'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) })

  async function onSubmit(data: ForgotPasswordInput) {
    const result = await requestPasswordReset(data)
    if (result && 'error' in result) {
      toast.error(result.error)
      return
    }
    setSent(true)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-5 py-10">
      <div className="w-full max-w-sm">
        <BackToHome />
      </div>
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        <h1 className="text-2xl font-bold text-slate-900">Recuperar palavra-passe</h1>

        {sent ? (
          <>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Se existir uma conta com esse email, enviámos um link para repor a palavra-passe. Verifique também a
              pasta de spam.
            </p>
            <Link
              href="/login"
              className="mt-6 flex min-h-11 w-full items-center justify-center rounded-xl bg-violet-600 text-sm font-semibold text-white transition hover:bg-violet-700"
            >
              Voltar ao login
            </Link>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-slate-500">Introduza o seu email e enviamos um link para repor a palavra-passe.</p>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full rounded-xl bg-violet-600 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
              >
                {isSubmitting ? 'A enviar...' : 'Enviar link'}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-500">
              Lembrou-se?{' '}
              <Link href="/login" className="font-semibold text-violet-600">
                Entrar
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
