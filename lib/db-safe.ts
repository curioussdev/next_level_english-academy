import 'server-only'

/**
 * Envolve uma leitura do Prisma numa página — se a BD tiver um soluço
 * momentâneo, a página degrada para o `fallback` em vez de rebentar com um
 * 500 genérico (app/error.tsx). Mesma ideia já usada em lib/cms.ts e
 * lib/notifications.ts, só que reutilizável em vez de repetir o try/catch
 * em cada page.tsx.
 */
export async function safeQuery<T>(fn: () => Promise<T>, fallback: T, context: string): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    console.warn(`[db] falha ao carregar "${context}", a usar fallback:`, err instanceof Error ? err.message : err)
    return fallback
  }
}
