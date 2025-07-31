"use client"

import React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { usePodcast } from "@/lib/podcast-context"

export default function GlobalMinimizedPlayer() {
  const { 
    currentPodcast, 
    playbackState, 
    isPlayerMinimized, 
    maximizePlayer, 
    closePlayer, 
    togglePlayback 
  } = usePodcast()

  if (!isPlayerMinimized || !currentPodcast || !playbackState) {
    return null
  }

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const progressPercentage = playbackState.duration > 0 
    ? (playbackState.position / playbackState.duration) * 100 
    : 0

  return (
    <TouchableOpacity 
      style={styles.minimizedPlayer} 
      onPress={maximizePlayer}
      activeOpacity={0.9}
    >
      <View style={styles.minimizedPlayerContent}>
        <View style={styles.minimizedArtwork}>
          <Text style={styles.minimizedEpisodeNumber}>{currentPodcast.episode_number}</Text>
        </View>
        
        <View style={styles.minimizedInfo}>
          <Text style={styles.minimizedTitle} numberOfLines={1}>
            {currentPodcast.title}
          </Text>
          <View style={styles.minimizedProgressContainer}>
            <View style={styles.minimizedProgressBar}>
              <View 
                style={[
                  styles.minimizedProgressFill, 
                  { width: `${progressPercentage}%` }
                ]} 
              />
            </View>
            <Text style={styles.minimizedTime}>
              {formatTime(playbackState.position)} / {formatTime(playbackState.duration)}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.minimizedPlayButton}
          onPress={async (e) => {
            e.stopPropagation()
            await togglePlayback()
          }}
        >
          <Ionicons 
            name={playbackState.isPlaying ? "pause" : "play"} 
            size={16} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.minimizedCloseButton}
          onPress={(e) => {
            e.stopPropagation()
            closePlayer()
          }}
        >
          <Ionicons name="close" size={16} color="#687076" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  minimizedPlayer: {
    position: "absolute",
    bottom: 83,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 1000,
  },
  minimizedPlayerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  minimizedArtwork: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  minimizedEpisodeNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  minimizedInfo: {
    flex: 1,
    marginRight: 12,
  },
  minimizedTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 4,
  },
  minimizedProgressContainer: {
    width: "100%",
  },
  minimizedProgressBar: {
    height: 2,
    backgroundColor: "#0f172a20",
    borderRadius: 1,
    overflow: "hidden",
    marginBottom: 2,
  },
  minimizedProgressFill: {
    height: "100%",
    backgroundColor: "#0f172a",
    borderRadius: 1,
  },
  minimizedTime: {
    fontSize: 12,
    color: "#687076",
    fontWeight: "500",
  },
  minimizedPlayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  minimizedCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0f172a10",
    justifyContent: "center",
    alignItems: "center",
  },
})
