export type PlanId = 'basic' | 'pro' | 'premium'

export interface Plan {
  id: PlanId
  title: string
  priceLabel: string
  text: string
  features: string[]
  featured?: boolean
}

/**
 * Metadados dos planos — seguro para uso em Client Components (sem chaves
 * do Stripe). O ID do Price do Stripe correspondente a cada plano só é
 * resolvido no servidor, em lib/actions/checkout.ts.
 */
export const PLANS: Plan[] = [
  {
    id: 'basic',
    title: 'Basic',
    priceLabel: '49 €',
    text: 'Para começar com confiança',
    features: ['Acesso ao curso principal', 'Aulas práticas semanais', 'Comunidade de alunos'],
  },
  {
    id: 'pro',
    title: 'Pro',
    priceLabel: '89 €',
    text: 'Para evoluir mais rápido',
    features: [
      'Tudo do plano Basic',
      'Trilhas de conversação',
      'Feedback mensal personalizado',
      'Certificado de conclusão',
    ],
    featured: true,
  },
  {
    id: 'premium',
    title: 'Premium',
    priceLabel: '149 €',
    text: 'Para resultados completos',
    features: ['Tudo do plano Pro', 'Encontros ao vivo semanais', 'Mentoria em grupo', 'Materiais exclusivos'],
  },
]
