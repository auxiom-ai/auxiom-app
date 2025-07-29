"use client"

import { useState, useEffect } from "react"
import { View, Text, Modal, TouchableOpacity, Dimensions, StyleSheet, StatusBar, Alert } from "react-native"
import { Audio } from "expo-av"
import type { Podcast } from "@/app/dashboard/podcasts"

interface PodcastPlayerProps {
  podcast: Podcast
  visible: boolean
  onClose: () => void
  onMarkAsListened: (podcastId: number) => void
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window")

export default function PodcastPlayer({ podcast, visible, onClose, onMarkAsListened }: PodcastPlayerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1.0)

  const playbackRates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0]

  useEffect(() => {
    if (visible) {
      loadAudio()
    } else {
      cleanup()
    }

    return () => {
      cleanup()
    }
  }, [visible])

  useEffect(() => {
    if (sound) {
      sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate)
    }
  }, [sound])

  const cleanup = () => {
    if (sound) {
      sound.unloadAsync()
      setSound(null)
    }
    setIsPlaying(false)
    setPosition(0)
    setDuration(0)
  }

  const loadAudio = async () => {
    try {
      setIsLoading(true)

      if (sound) {
        await sound.unloadAsync()
      }

      if (!podcast.audio_file_url || podcast.audio_file_url.trim() === "") {
        Alert.alert("Error", "Invalid audio file URL")
        return
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: podcast.audio_file_url.trim() },
        { shouldPlay: false, rate: playbackRate },
      )

      setSound(newSound)
    } catch (error) {
      console.error("Error loading audio:", error)
      Alert.alert("Error", "Failed to load podcast audio")
    } finally {
      setIsLoading(false)
    }
  }

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis || 0)
      setDuration(status.durationMillis || 0)
      setIsPlaying(status.isPlaying || false)

      // Mark as listened when finished
      if (status.durationMillis && status.positionMillis >= status.durationMillis) {
        onMarkAsListened(podcast.id)
      }
    }
  }

  const togglePlayback = async () => {
    if (!sound) return

    try {
      if (isPlaying) {
        await sound.pauseAsync()
      } else {
        await sound.playAsync()
      }
    } catch (error) {
      console.error("Error toggling playback:", error)
    }
  }

  const seekTo = async (positionMillis: number) => {
    if (!sound) return

    try {
      await sound.setPositionAsync(positionMillis)
    } catch (error) {
      console.error("Error seeking:", error)
    }
  }

  const skipForward = () => {
    const newPosition = Math.min(position + 30000, duration)
    seekTo(newPosition)
  }

  const skipBackward = () => {
    const newPosition = Math.max(position - 15000, 0)
    seekTo(newPosition)
  }

  const changePlaybackRate = async () => {
    const currentIndex = playbackRates.indexOf(playbackRate)
    const nextIndex = (currentIndex + 1) % playbackRates.length
    const newRate = playbackRates[nextIndex]

    setPlaybackRate(newRate)

    if (sound) {
      try {
        await sound.setRateAsync(newRate, true)
      } catch (error) {
        console.error("Error changing playback rate:", error)
      }
    }
  }

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const progressPercentage = duration > 0 ? (position / duration) * 100 : 0

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8EC" />
      <View style={styles.playerContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Now Playing</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Podcast Artwork */}
        <View style={styles.artworkContainer}>
          <View style={styles.artwork}>
            <Text style={styles.artworkEpisode}>{podcast.episode_number}</Text>
          </View>
        </View>

        {/* Podcast Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.podcastTitle} numberOfLines={2}>
            {podcast.title}
          </Text>
          <Text style={styles.podcastEpisode}>Episode {podcast.episode_number}</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
            <TouchableOpacity style={[styles.progressThumb, { left: `${progressPercentage}%` }]} />
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.controlButton} onPress={skipBackward}>
            <Text style={styles.controlIcon}>⏪</Text>
            <Text style={styles.controlLabel}>15s</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.playButton} onPress={togglePlayback} disabled={isLoading}>
            {isLoading ? (
              <Text style={styles.playButtonText}>⏳</Text>
            ) : (
              <Text style={styles.playButtonText}>{isPlaying ? "⏸" : "▶"}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={skipForward}>
            <Text style={styles.controlIcon}>⏩</Text>
            <Text style={styles.controlLabel}>30s</Text>
          </TouchableOpacity>
        </View>

        {/* Additional Controls */}
        <View style={styles.additionalControls}>
          <TouchableOpacity style={styles.speedButton} onPress={changePlaybackRate}>
            <Text style={styles.speedButtonText}>{playbackRate}×</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => onMarkAsListened(podcast.id)}>
            <Text style={styles.actionButtonText}>{podcast.listened ? "Listened ✓" : "Mark as Listened"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  playerContainer: {
    flex: 1,
    backgroundColor: "#FAF8EC",
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0f172a20",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#0f172a",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  placeholder: {
    width: 32,
  },
  artworkContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  artwork: {
    width: 240,
    height: 240,
    borderRadius: 24,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  artworkEpisode: {
    fontSize: 48,
    fontWeight: "700",
    color: "#FAF8EC",
  },
  infoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  podcastTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
    lineHeight: 28,
    marginBottom: 8,
  },
  podcastEpisode: {
    fontSize: 16,
    color: "#687076",
    fontWeight: "500",
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#0f172a20",
    borderRadius: 2,
    position: "relative",
    marginBottom: 12,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#0f172a",
    borderRadius: 2,
  },
  progressThumb: {
    position: "absolute",
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#0f172a",
    marginLeft: -8,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeText: {
    fontSize: 14,
    color: "#687076",
    fontWeight: "500",
  },
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  controlButton: {
    alignItems: "center",
    marginHorizontal: 24,
  },
  controlIcon: {
    fontSize: 24,
    color: "#0f172a",
    marginBottom: 4,
  },
  controlLabel: {
    fontSize: 12,
    color: "#687076",
    fontWeight: "500",
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0f172a",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  playButtonText: {
    fontSize: 32,
    color: "#FAF8EC",
    marginLeft: 2,
  },
  additionalControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  speedButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#0f172a20",
    borderRadius: 16,
  },
  speedButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#0f172a",
    borderRadius: 16,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FAF8EC",
  },
})
