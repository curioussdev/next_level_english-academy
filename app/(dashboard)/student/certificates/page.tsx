import { Award } from 'lucide-react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isDemoUser } from '@/lib/demo'
import { formatDate } from '@/lib/format'
import { safeQuery } from '@/lib/db-safe'

export default async function StudentCertificatesPage() {
  const session = await auth()
  const userId = session!.user.id

  // Emissão de certificados ainda não está automatizada — mesmo em modo
  // demo, o estado "sem certificados" é o real e honesto de mostrar.
  const certificates = isDemoUser(userId)
    ? []
    : await safeQuery(
        () =>
          prisma.certificate.findMany({
            where: { userId },
            orderBy: { issuedAt: 'desc' },
            include: { course: { select: { title: true } } },
          }),
        [],
        'certificados',
      )

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight">Certificados</h1>

      {certificates.length === 0 ? (
        <div className="mt-10 rounded-3xl bg-card p-8 text-center shadow-sm ring-1 ring-border">
          <Award className="mx-auto text-primary" size={28} />
          <h2 className="mt-4 text-lg font-bold">Ainda sem certificados</h2>
          <p className="mt-2 text-sm text-muted-foreground">Conclua um curso para receber o seu certificado.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {certificates.map((certificate) => (
            <div key={certificate.id} className="rounded-3xl border border-border bg-card p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Award size={20} />
              </div>
              <h3 className="mt-3 font-bold">{certificate.course.title}</h3>
              <p className="mt-1 font-mono text-xs text-muted-foreground">{certificate.certificateNumber}</p>
              <p className="mt-2 text-sm text-muted-foreground">Emitido em {formatDate(certificate.issuedAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
