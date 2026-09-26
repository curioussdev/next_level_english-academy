/**
 * URL pública da app, usada para montar links em emails e redirects do
 * Stripe. Em produção sem `NEXTAUTH_URL` definida, isto apontaria
 * silenciosamente para localhost — em vez de deixar isso passar em
 * silêncio, regista um erro bem visível nos logs do servidor (não lança:
 * um checkout ou reset de senha a falhar de vez seria pior que um link
 * temporariamente errado).
 */
export function getAppUrl(): string {
  const url = process.env.NEXTAUTH_URL
  if (!url) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[env] NEXTAUTH_URL não está definida em produção — a usar localhost como fallback. Links em emails/checkout vão ficar errados até isto ser corrigido.')
    }
    return 'http://localhost:3000'
  }
  return url.replace(/\/$/, '')
}
