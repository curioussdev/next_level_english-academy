export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />
}

/** Cabeçalho de página + grelha de KPIs (4 cards) — Visão geral, Director. */
export function StatGridSkeleton() {
  return (
    <div className="mx-auto max-w-6xl">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-2 h-8 w-64" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="mt-6 h-72 rounded-3xl" />
    </div>
  )
}

/** Cabeçalho + tabela — Alunos, Vendas. */
export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="mx-auto max-w-6xl">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="mt-2 h-4 w-56" />
      <div className="mt-6 space-y-3 rounded-3xl bg-card p-5 ring-1 ring-border">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  )
}

/** Cabeçalho + grelha de cards — Cursos, CRM. */
export function CardGridSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="mx-auto max-w-6xl">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="mt-2 h-4 w-56" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cards }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

/** Cabeçalho + formulário — Conteúdo, Configurações, edição de perfil. */
export function FormSkeleton() {
  return (
    <div className="mx-auto max-w-2xl">
      <Skeleton className="h-8 w-40" />
      <div className="mt-6 space-y-4 rounded-3xl bg-card p-6 ring-1 ring-border">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-11 w-32" />
      </div>
    </div>
  )
}

/** Vídeo de aula — player em destaque + texto abaixo. */
export function LessonSkeleton() {
  return (
    <div className="mx-auto max-w-5xl">
      <Skeleton className="h-3 w-56" />
      <Skeleton className="mt-3 h-7 w-80" />
      <Skeleton className="mt-6 aspect-video w-full rounded-2xl" />
      <Skeleton className="mt-8 h-24 w-full rounded-2xl" />
    </div>
  )
}

/** Formulário de criação + lista de cards abaixo — Sub-admins. */
export function FormWithListSkeleton({ cards = 2 }: { cards?: number }) {
  return (
    <div className="mx-auto max-w-4xl">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="mt-2 h-4 w-96" />
      <Skeleton className="mt-8 h-48 w-full rounded-2xl" />
      <Skeleton className="mt-10 h-5 w-48" />
      <div className="mt-3 space-y-3">
        {Array.from({ length: cards }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
