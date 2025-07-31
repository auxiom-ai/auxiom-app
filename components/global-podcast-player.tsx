"use client"

import React, { useCallback, useRef } from "react"
import { usePodcast } from "@/lib/podcast-context"
import PodcastPlayer from "@/components/podcast-player"

interface GlobalPodcastPlayerProps {
  onMarkAsCompleted: (podcastId: number) => void
}

export default function GlobalPodcastPlayer({ onMarkAsCompleted }: GlobalPodcastPlayerProps) {
  const { 
    currentPodcast, 
    playbackState, 
    isPlayerVisible, 
    closePlayer, 
    minimizePlayer, 
    setPlaybackState 
  } = usePodcast()

  // Use a ref to track the last update time to debounce updates
  const lastUpdateRef = useRef(0)
  const DEBOUNCE_MS = 1000 // Only update context every 1 second

  const handlePlaybackStateChange = useCallback((state: any) => {
    const now = Date.now()
    // Only update context periodically to avoid infinite re-renders
    // Always update when play/pause state changes, but debounce position updates
    if (playbackState?.isPlaying !== state.isPlaying || now - lastUpdateRef.current > DEBOUNCE_MS) {
      setPlaybackState(state)
      lastUpdateRef.current = now
    }
  }, [setPlaybackState, playbackState?.isPlaying])

  if (!currentPodcast) {
    return null
  }

  return (
    <PodcastPlayer
      podcast={currentPodcast}
      visible={isPlayerVisible}
      onClose={closePlayer}
      onMinimize={minimizePlayer}
      onMarkAsCompleted={onMarkAsCompleted}
      onPlaybackStateChange={handlePlaybackStateChange}
      isMinimized={false}
      initialState={playbackState ? playbackState : undefined}
    />
  )
}
