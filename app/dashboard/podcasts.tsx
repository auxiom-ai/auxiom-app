"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native"
import { Audio } from "expo-av"
import { useAuth } from "@/lib/auth-context"
import { getUserPodcasts } from "@/lib/actions"
import { updatePodcastListenedStatus } from "@/lib/db/queries"
import PodcastPlayer from "@/components/podcast-player"

export interface Podcast {
  id: number
  title: string
  episode_number: number
  date: string
  duration: string
  audio_file_url: string
  listened: boolean
  clusters: { title: string; description: string; gov: string[]; news: string[] }[]
}

export default function PodcastsScreen() {
  const { user, loading } = useAuth()
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [podcastsLoading, setPodcastsLoading] = useState(true)
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null)
  const [playerVisible, setPlayerVisible] = useState(false)

  useEffect(() => {
    if (user) {
      loadPodcasts()
    }
  }, [user])

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

  const loadPodcasts = async () => {
    try {
      setPodcastsLoading(true)
      const podcastData = await getUserPodcasts()
      const sortedPodcasts = podcastData.sort((a, b) => b.id - a.id)
      setPodcasts(sortedPodcasts)
    } catch (error) {
      console.error("Error loading podcasts:", error)
      Alert.alert("Error", "Failed to load podcasts")
    } finally {
      setPodcastsLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadPodcasts()
    setRefreshing(false)
  }

  const handlePodcastPress = (podcast: Podcast) => {
    setSelectedPodcast(podcast)
    setPlayerVisible(true)
  }

  const markAsListened = async (podcastId: number) => {
    try {
      await updatePodcastListenedStatus(podcastId)
      setPodcasts((prevPodcasts) =>
        prevPodcasts.map((podcast) => (podcast.id === podcastId ? { ...podcast, listened: true } : podcast)),
      )
    } catch (error) {
      console.error("Error marking podcast as listened:", error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatDuration = (duration: string) => {
    // Convert duration to minutes if it's in a different format
    return duration
  }

  if (loading || !user || podcastsLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0f172a" />
          <Text style={styles.loadingText}>Loading podcasts...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Image source={require("@/assets/auxiom-logo.png")} style={styles.logoImage} resizeMode="contain" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Podcasts</Text>
            <Text style={styles.headerSubtitle}>
              {user.name ? `Welcome back, ${user.name.split(" ")[0]}` : "Welcome back"}
            </Text>
          </View>
        </View>
      </View>

      {/* Podcasts List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0f172a" colors={["#0f172a"]} />
        }
      >
        <View style={styles.podcastsContainer}>
          {podcasts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No podcasts yet</Text>
              <Text style={styles.emptyStateSubtitle}>Your podcasts will appear here when available</Text>
            </View>
          ) : (
            podcasts.map((podcast, index) => (
              <TouchableOpacity
                key={podcast.id}
                style={[
                  styles.podcastCard,
                  index === 0 && styles.firstCard,
                  index === podcasts.length - 1 && styles.lastCard,
                ]}
                onPress={() => handlePodcastPress(podcast)}
                activeOpacity={0.7}
              >
                <View style={styles.podcastArtwork}>
                  <View style={styles.artworkPlaceholder}>
                    <Text style={styles.episodeNumber}>{podcast.episode_number}</Text>
                  </View>
                  {!podcast.listened && <View style={styles.unreadIndicator} />}
                </View>

                <View style={styles.podcastInfo}>
                  <Text style={styles.podcastTitle} numberOfLines={2}>
                    {podcast.title}
                  </Text>
                  <Text style={styles.podcastMeta}>
                    Episode {podcast.episode_number} • {formatDate(podcast.date)}
                  </Text>
                  <Text style={styles.podcastDuration}>{formatDuration(podcast.duration)}</Text>
                </View>

                <View style={styles.podcastActions}>
                  {podcast.listened && (
                    <View style={styles.listenedBadge}>
                      <Text style={styles.listenedBadgeText}>✓</Text>
                    </View>
                  )}
                  <TouchableOpacity style={styles.playButton}>
                    <Text style={styles.playButtonIcon}>▶</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Podcast Player Modal */}
      {selectedPodcast && (
        <PodcastPlayer
          podcast={selectedPodcast}
          visible={playerVisible}
          onClose={() => {
            setPlayerVisible(false)
            setSelectedPodcast(null)
          }}
          onMarkAsListened={markAsListened}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAF8EC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAF8EC",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#687076",
    fontWeight: "500",
  },
  header: {
    backgroundColor: "#FAF8EC",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  logoImage: {
    width: 32,
    height: 32,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#687076",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#FAF8EC",
  },
  podcastsContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: "#687076",
    textAlign: "center",
  },
  podcastCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#FAF8EC",
    borderRadius: 16,
    marginVertical: 4,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#0f172a20",
  },
  firstCard: {
    marginTop: 8,
  },
  lastCard: {
    marginBottom: 8,
  },
  podcastArtwork: {
    position: "relative",
    marginRight: 16,
  },
  artworkPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
  },
  episodeNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  unreadIndicator: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF3B30",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  podcastInfo: {
    flex: 1,
    marginRight: 12,
  },
  podcastTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    lineHeight: 22,
    marginBottom: 4,
  },
  podcastMeta: {
    fontSize: 14,
    color: "#687076",
    marginBottom: 2,
  },
  podcastDuration: {
    fontSize: 13,
    color: "#687076",
    fontWeight: "500",
  },
  podcastActions: {
    alignItems: "center",
    justifyContent: "center",
  },
  listenedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#34C759",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  listenedBadgeText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
  },
  playButtonIcon: {
    fontSize: 16,
    color: "#FFFFFF",
    marginLeft: 2,
  },
})
