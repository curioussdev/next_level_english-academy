import { getAppUrl } from '@/lib/env'

function layout(bodyHtml: string) {
  return `<!DOCTYPE html>
<html lang="pt">
  <body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);">
            <tr>
              <td style="background:linear-gradient(135deg,#7c3aed,#3b82f6);padding:28px 32px;">
                <span style="color:#ffffff;font-size:18px;font-weight:700;">next<span style="color:#c4b5fd;">level</span></span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid #f1f5f9;">
                <p style="margin:0;font-size:12px;color:#94a3b8;">Next Level — Eleve o seu inglês. Emigrantes em Portugal a aprender inglês de forma prática.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

function button(url: string, label: string) {
  return `<a href="${url}" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#7c3aed;color:#ffffff;text-decoration:none;border-radius:9999px;font-weight:600;font-size:14px;">${label}</a>`
}

export function welcomeEmail(name: string) {
  return layout(`
    <h1 style="margin:0 0 8px;font-size:22px;color:#0f172a;">Bem-vindo(a), ${name}!</h1>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#475569;">
      A sua conta na Next Level foi criada com sucesso. Já pode explorar o catálogo de cursos e começar a evoluir o seu inglês hoje mesmo.
    </p>
    ${button(`${getAppUrl()}/student/courses`, 'Explorar cursos')}
  `)
}

export function passwordResetEmail(resetUrl: string) {
  return layout(`
    <h1 style="margin:0 0 8px;font-size:22px;color:#0f172a;">Recuperar palavra-passe</h1>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#475569;">
      Pediu para repor a sua palavra-passe. Clique no botão abaixo — este link expira em 1 hora e só pode ser usado uma vez.
    </p>
    ${button(resetUrl, 'Repor palavra-passe')}
    <p style="margin:20px 0 0;font-size:12px;line-height:1.6;color:#94a3b8;">
      Se não foi você quem pediu isto, pode ignorar este email com segurança — a sua palavra-passe não será alterada.
    </p>
  `)
}

export function accountCreatedByStaffEmail(name: string, email: string, tempPassword: string) {
  return layout(`
    <h1 style="margin:0 0 8px;font-size:22px;color:#0f172a;">Bem-vindo(a) à Next Level, ${name}!</h1>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#475569;">
      Foi criada uma conta para si na plataforma. Use estas credenciais para entrar — recomendamos que altere a palavra-passe assim que entrar pela primeira vez.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;background:#f8fafc;border-radius:12px;">
      <tr><td style="padding:16px;">
        <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">Email</p>
        <p style="margin:0 0 12px;font-size:14px;color:#0f172a;font-weight:600;">${email}</p>
        <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">Palavra-passe temporária</p>
        <p style="margin:0;font-size:16px;color:#0f172a;font-weight:700;font-family:monospace;">${tempPassword}</p>
      </td></tr>
    </table>
    ${button(`${getAppUrl()}/login`, 'Entrar agora')}
  `)
}

export function newRegistrationNotificationEmail(name: string, email: string) {
  return layout(`
    <h1 style="margin:0 0 8px;font-size:20px;color:#0f172a;">Novo aluno registado</h1>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#475569;">
      <strong>${name}</strong> (${email}) acabou de criar uma conta na plataforma.
    </p>
  `)
}

export function newPurchaseNotificationEmail(customerLabel: string, description: string, amountLabel: string) {
  return layout(`
    <h1 style="margin:0 0 8px;font-size:20px;color:#0f172a;">Nova compra confirmada</h1>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#475569;">
      <strong>${customerLabel}</strong> comprou <strong>${description}</strong> por ${amountLabel}.
    </p>
  `)
}
