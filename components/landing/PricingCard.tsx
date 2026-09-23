'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Check } from 'lucide-react'
import { createPlanCheckoutSession } from '@/lib/actions/checkout'
import type { PlanId, Plan } from '@/lib/plans'

export function PricingCard({ plan }: { plan: Plan }) {
  const { title, priceLabel, text, features, featured = false } = plan
  const [isPending, startTransition] = useTransition()

  function handleClick(planId: PlanId) {
    startTransition(async () => {
      try {
        await createPlanCheckoutSession(planId)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Não foi possível iniciar o checkout.')
      }
    })
  }

  return (
    <div
      className={`relative rounded-3xl p-7 ${featured ? 'bg-gradient-to-br from-violet-600 to-blue-600 text-white shadow-2xl shadow-violet-500/20' : 'border border-slate-200 bg-white'}`}
    >
      {featured && <span className="absolute right-6 top-6 rounded-full bg-white/15 px-3 py-1 text-xs font-bold">Mais escolhido</span>}
      <p className={`font-bold ${featured ? 'text-violet-100' : 'text-violet-600'}`}>{title}</p>
      <p className="mt-5 text-4xl font-bold">
        {priceLabel}
        <span className={`text-sm font-normal ${featured ? 'text-white/60' : 'text-slate-400'}`}>/mês</span>
      </p>
      <p className={`mt-2 text-sm ${featured ? 'text-white/65' : 'text-slate-500'}`}>{text}</p>
      <ul className="mt-7 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm">
            <Check size={16} className={featured ? 'text-teal-300' : 'text-teal-500'} />
            {f}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => handleClick(plan.id)}
        disabled={isPending}
        className={`mt-8 min-h-11 w-full rounded-full py-3 text-sm font-bold transition disabled:opacity-60 ${
          featured ? 'bg-white text-violet-700 hover:bg-violet-50' : 'bg-slate-950 text-white hover:bg-violet-600'
        }`}
      >
        {isPending ? 'A abrir checkout...' : 'Começar agora'}
      </button>
    </div>
  )
}
