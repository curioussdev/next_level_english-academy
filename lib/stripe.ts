import Stripe from 'stripe'

let stripeClient: Stripe | undefined

/**
 * Instanciação lazy: evita que o build/collect de rotas do Next.js quebre
 * antes de STRIPE_SECRET_KEY estar configurada. O erro só ocorre se algo
 * tentar de fato usar o Stripe sem a chave definida.
 */
export function getStripe(): Stripe {
  if (!stripeClient) {
    const apiKey = process.env.STRIPE_SECRET_KEY
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY não está configurada.')
    }
    stripeClient = new Stripe(apiKey, {
      apiVersion: '2026-08-26.dahlia',
      typescript: true,
    })
  }
  return stripeClient
}
