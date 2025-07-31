"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { Audio } from "expo-av"
import type { Podcast } from "@/app/dashboard/podcasts"

interface PlaybackState {
  isPlaying: boolean
  position: number
  duration: number
  sound: Audio.Sound | null
}

interface PodcastContextType {
  // Current podcast state
  currentPodcast: Podcast | null
  playbackState: PlaybackState | null
  isPlayerMinimized: boolean
  isPlayerVisible: boolean
  
  // Actions
  setCurrentPodcast: (podcast: Podcast | null) => void
  setPlaybackState: (state: PlaybackState | null) => void
  showPlayer: () => void
  hidePlayer: () => void
  minimizePlayer: () => void
  maximizePlayer: () => void
  closePlayer: () => void
  
  // Playback controls for minimized player
  togglePlayback: () => Promise<void>
}

const PodcastContext = createContext<PodcastContextType | undefined>(undefined)

interface PodcastProviderProps {
  children: ReactNode
}

export function PodcastProvider({ children }: PodcastProviderProps) {
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null)
  const [playbackState, setPlaybackState] = useState<PlaybackState | null>(null)
  const [isPlayerMinimized, setIsPlayerMinimized] = useState(false)
  const [isPlayerVisible, setIsPlayerVisible] = useState(false)

  // Configure audio on mount
  useEffect(() => {
    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        })
      } catch (error) {
        console.error("Error setting audio mode:", error)
      }
    }
    configureAudio()
  }, [])

  const showPlayer = () => {
    setIsPlayerVisible(true)
    setIsPlayerMinimized(false)
  }

  const hidePlayer = () => {
    setIsPlayerVisible(false)
  }

  const minimizePlayer = () => {
    setIsPlayerVisible(false)
    setIsPlayerMinimized(true)
  }

  const maximizePlayer = () => {
    setIsPlayerVisible(true)
    setIsPlayerMinimized(false)
  }

  const closePlayer = () => {
    // Clean up audio if it exists
    if (playbackState?.sound) {
      try {
        playbackState.sound.unloadAsync()
      } catch (error) {
        console.error("Error cleaning up audio:", error)
      }
    }
    
    setIsPlayerVisible(false)
    setIsPlayerMinimized(false)
    setCurrentPodcast(null)
    setPlaybackState(null)
  }

  const togglePlayback = async () => {
    if (!playbackState?.sound) return

    try {
      if (playbackState.isPlaying) {
        await playbackState.sound.pauseAsync()
      } else {
        await playbackState.sound.playAsync()
      }
    } catch (error) {
      console.error("Error toggling playback:", error)
    }
  }

  const contextValue: PodcastContextType = {
    currentPodcast,
    playbackState,
    isPlayerMinimized,
    isPlayerVisible,
    setCurrentPodcast,
    setPlaybackState,
    showPlayer,
    hidePlayer,
    minimizePlayer,
    maximizePlayer,
    closePlayer,
    togglePlayback,
  }

  return (
    <PodcastContext.Provider value={contextValue}>
      {children}
    </PodcastContext.Provider>
  )
}

export function usePodcast() {
  const context = useContext(PodcastContext)
  if (context === undefined) {
    throw new Error("usePodcast must be used within a PodcastProvider")
  }
  return context
}
