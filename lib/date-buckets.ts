const MONTH_FORMATTER = new Intl.DateTimeFormat('pt-PT', { month: 'short' })

export function monthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`
}

/** Últimos `count` meses (mais antigo primeiro), com a chave usada para agrupar e um rótulo curto para o eixo do gráfico. */
export function buildMonthBuckets(count: number) {
  const now = new Date()
  const buckets: { key: string; label: string }[] = []

  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({ key: monthKey(date), label: capitalize(MONTH_FORMATTER.format(date)) })
  }

  return buckets
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function startOfMonthsAgo(count: number) {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() - (count - 1), 1)
}
