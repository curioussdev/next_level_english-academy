'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Lock } from 'lucide-react'
import { updateOwnProfile } from '@/lib/actions/profile'

type FormValues = {
  name: string
  phone: string
  bio: string
  dateOfBirth: string
  country: string
  city: string
  currentLevel: string
  learningGoals: string
}

const inputClass =
  'mt-1 h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100'

/**
 * Auto-edição de perfil, usada pelo aluno e por admin/diretor. `nif` só é
 * mostrado (sempre bloqueado) quando fornecido. `showLearnerFields`
 * esconde nível/objetivos de aprendizagem para contas de staff.
 */
export function OwnProfileForm({
  initial,
  nif,
  showLearnerFields = true,
}: {
  initial: FormValues
  nif?: string | null
  showLearnerFields?: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [values, setValues] = useState(initial)

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      try {
        await updateOwnProfile(values)
        toast.success('Perfil atualizado.')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Não foi possível guardar.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Nome
        </label>
        <input id="name" required value={values.name} onChange={(e) => set('name', e.target.value)} className={inputClass} />
      </div>

      {nif !== undefined && (
        <div>
          <label htmlFor="nif" className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
            NIF <Lock size={12} className="text-slate-400" />
          </label>
          <input id="nif" disabled value={nif ?? 'Não definido'} className={`${inputClass} cursor-not-allowed bg-slate-50 dark:bg-slate-800 text-slate-400`} />
          <p className="mt-1 text-xs text-slate-400">Só a administração pode definir ou corrigir o NIF.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Telefone
          </label>
          <input id="phone" value={values.phone} onChange={(e) => set('phone', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="dateOfBirth" className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Data de nascimento
          </label>
          <input
            id="dateOfBirth"
            type="date"
            value={values.dateOfBirth}
            onChange={(e) => set('dateOfBirth', e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="country" className="text-sm font-medium text-slate-700 dark:text-slate-200">
            País
          </label>
          <input id="country" value={values.country} onChange={(e) => set('country', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="city" className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Cidade
          </label>
          <input id="city" value={values.city} onChange={(e) => set('city', e.target.value)} className={inputClass} />
        </div>
        {showLearnerFields && (
          <div>
            <label htmlFor="currentLevel" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Nível de inglês
            </label>
            <select
              id="currentLevel"
              value={values.currentLevel}
              onChange={(e) => set('currentLevel', e.target.value)}
              className={inputClass}
            >
              <option value="">—</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        )}
      </div>

      {showLearnerFields && (
        <div>
          <label htmlFor="learningGoals" className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Objetivos de aprendizagem
          </label>
          <textarea
            id="learningGoals"
            rows={2}
            value={values.learningGoals}
            onChange={(e) => set('learningGoals', e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
        </div>
      )}

      <div>
        <label htmlFor="bio" className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Bio
        </label>
        <textarea
          id="bio"
          rows={3}
          value={values.bio}
          onChange={(e) => set('bio', e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="h-11 rounded-xl bg-violet-600 px-6 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
      >
        {isPending ? 'A guardar...' : 'Guardar alterações'}
      </button>
    </form>
  )
}
