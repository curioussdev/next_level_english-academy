import { Resend } from 'resend'

let client: Resend | undefined

/**
 * Instanciação lazy, mesmo padrão de lib/stripe.ts — evita quebrar o build
 * antes de RESEND_API_KEY estar configurada; o erro só ocorre se algo
 * tentar mesmo enviar um email sem a chave.
 */
export function getResend(): Resend {
  if (!client) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY não está configurada.')
    }
    client = new Resend(apiKey)
  }
  return client
}

export const EMAIL_FROM = process.env.EMAIL_FROM ?? 'Next Level <onboarding@resend.dev>'
export const CONTACT_EMAIL = process.env.CONTACT_EMAIL

/**
 * Envia um email sem nunca lançar — falha de email não deve derrubar a
 * ação que a chamou (registo, checkout, etc.). Loga o erro e segue.
 */
export async function sendEmail(params: { to: string; subject: string; html: string }) {
  try {
    const resend = getResend()
    const result = await resend.emails.send({ from: EMAIL_FROM, to: params.to, subject: params.subject, html: params.html })
    if (result.error) {
      console.warn('[email] falha ao enviar:', result.error)
      return false
    }
    return true
  } catch (err) {
    console.warn('[email] não configurado ou falhou:', err instanceof Error ? err.message : err)
    return false
  }
}
