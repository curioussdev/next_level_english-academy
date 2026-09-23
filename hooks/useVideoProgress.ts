'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { YouTubePlayer } from 'react-youtube'
import { updateProgress } from '@/lib/actions/progress'

const HEARTBEAT_INTERVAL_MS = 10_000

/**
 * Envia heartbeats periódicos (a cada 10s) com o tempo atual do vídeo para o
 * servidor, enquanto o player estiver em reprodução. Também expõe um envio
 * imediato (pausa/fim) para não perder o último ponto assistido.
 */
export function useVideoProgress(lessonId: string) {
  const playerRef = useRef<YouTubePlayer | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const sendHeartbeat = useCallback(
    async (isCompleted = false) => {
      const player = playerRef.current
      if (!player) return

      try {
        const [currentTime, duration] = await Promise.all([player.getCurrentTime(), player.getDuration()])
        await updateProgress(lessonId, Math.floor(currentTime), Math.floor(duration), isCompleted)
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
    if (intervalRef.current) return
    intervalRef.current = setInterval(() => {
      void sendHeartbeat()
    }, HEARTBEAT_INTERVAL_MS)
  }, [sendHeartbeat])

  useEffect(() => stopHeartbeat, [stopHeartbeat])

  return { playerRef, startHeartbeat, stopHeartbeat, sendHeartbeat }
}
