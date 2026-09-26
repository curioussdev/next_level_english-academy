'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { YouTubePlayer } from 'react-youtube'
import { updateProgress } from '@/lib/actions/progress'

const HEARTBEAT_INTERVAL_MS = 10_000
// Mesmo teto usado em lib/actions/progress.ts — nunca reportar mais tempo
// assistido do que isto de uma vez, mesmo que o separem vários segundos de
// atraso (aba em segundo plano, tab throttling) entre dois heartbeats.
const MAX_WATCHED_SECONDS_PER_HEARTBEAT = 13

/**
 * Envia heartbeats periódicos (a cada 10s) com o tempo atual do vídeo para o
 * servidor, enquanto o player estiver em reprodução. Também expõe um envio
 * imediato (pausa/buffering/fim) para não perder o último ponto assistido —
 * reporta o tempo real decorrido desde o heartbeat anterior (não um valor
 * fixo), para pausar/retomar com frequência não inflacionar o tempo total.
 */
export function useVideoProgress(lessonId: string) {
  const playerRef = useRef<YouTubePlayer | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastHeartbeatAt = useRef<number | null>(null)

  const sendHeartbeat = useCallback(
    async (isCompleted = false) => {
      const player = playerRef.current
      if (!player) return

      try {
        const [currentTime, duration] = await Promise.all([player.getCurrentTime(), player.getDuration()])
        const now = Date.now()
        const watchedSeconds = lastHeartbeatAt.current
          ? Math.min(Math.max(0, Math.round((now - lastHeartbeatAt.current) / 1000)), MAX_WATCHED_SECONDS_PER_HEARTBEAT)
          : 0
        lastHeartbeatAt.current = now
        await updateProgress(lessonId, Math.floor(currentTime), Math.floor(duration), isCompleted, watchedSeconds)
      } catch {
        // Falha de rede pontual não deve interromper a reprodução do aluno.
      }
    },
    [lessonId],
  )

  const stopHeartbeat = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startHeartbeat = useCallback(() => {
    if (lastHeartbeatAt.current === null) lastHeartbeatAt.current = Date.now()
    if (intervalRef.current) return
    intervalRef.current = setInterval(() => {
      void sendHeartbeat()
    }, HEARTBEAT_INTERVAL_MS)
  }, [sendHeartbeat])

  useEffect(() => stopHeartbeat, [stopHeartbeat])

  return { playerRef, startHeartbeat, stopHeartbeat, sendHeartbeat }
}
