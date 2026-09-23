export function formatCurrency(amount: number | string | { toString(): string }, currency = 'EUR') {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency }).format(Number(amount.toString()))
}

export function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}min`
  return `${minutes}min`
}

export function formatDate(date: Date) {
  return date.toLocaleDateString('pt-PT')
}

export function formatDateTime(date: Date) {
  return date.toLocaleString('pt-PT')
}
