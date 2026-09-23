'use client'

import YouTube, { type YouTubeEvent } from 'react-youtube'
import { useVideoProgress } from '@/hooks/useVideoProgress'

interface YouTubePlayerProps {
  lessonId: string
  youtubeVideoId: string
  /** Ponto (em segundos) de onde retomar, vindo de Progress.lastWatchedTimestamp */
  startAt?: number
}

export function YouTubePlayer({ lessonId, youtubeVideoId, startAt = 0 }: YouTubePlayerProps) {
  const { playerRef, startHeartbeat, stopHeartbeat, sendHeartbeat } = useVideoProgress(lessonId)

  function handleReady(event: YouTubeEvent) {
    playerRef.current = event.target
    if (startAt > 0) {
      event.target.seekTo(startAt, true)
    }
  }

  function handleStateChange(event: YouTubeEvent<number>) {
    switch (event.data) {
      case YouTube.PlayerState.PLAYING:
        startHeartbeat()
        break
      case YouTube.PlayerState.PAUSED:
      case YouTube.PlayerState.BUFFERING:
        stopHeartbeat()
        void sendHeartbeat()
        break
      default:
        break
    }
  }

  function handleEnd() {
    stopHeartbeat()
    void sendHeartbeat(true)
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-3xl bg-black">
      <YouTube
        videoId={youtubeVideoId}
        opts={{
          width: '100%',
          height: '100%',
          playerVars: { rel: 0, modestbranding: 1 },
        }}
        className="h-full w-full"
        iframeClassName="h-full w-full"
        onReady={handleReady}
        onStateChange={handleStateChange}
        onEnd={handleEnd}
      />
    </div>
  )
}
