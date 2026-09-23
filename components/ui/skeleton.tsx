export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-800 ${className}`} />
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
      <div className="mt-6 space-y-3 rounded-3xl bg-white p-5 ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
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
      <div className="mt-6 space-y-4 rounded-3xl bg-white p-6 ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-11 w-32" />
      </div>
    </div>
  )
}
