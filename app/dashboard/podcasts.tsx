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
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "@/lib/auth-context"
import { usePodcast } from "@/lib/podcast-context"
import { getUserPodcasts } from "@/lib/actions"
import { updatePodcastCompletedStatus } from "@/lib/db/queries"
import PodcastDropdown from "@/components/podcast-dropdown"
import RevenueCatUI from "react-native-purchases-ui";

export interface Podcast {
  id: number
  title: string
  episode_number: number
  date: string
  duration: string
  audio_file_url: string
  completed: boolean
  clusters: { title: string; description: string; gov: string[]; news: string[] }[]
}

export default function PodcastsScreen() {
  const { user, loading } = useAuth()
  const { setCurrentPodcast, showPlayer } = usePodcast()
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [podcastsLoading, setPodcastsLoading] = useState(true)
  const [expandedPodcast, setExpandedPodcast] = useState<number | null>(null)

  useEffect(() => {
    if (user) {
      loadPodcasts()
    }
  }, [user])

  const loadPodcasts = async () => {
    try {
      setPodcastsLoading(true)
      if (!user) {
        Alert.alert("Error", "User not authenticated")
        return
      }
      const podcastData = await getUserPodcasts(user.id)
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
    setCurrentPodcast(podcast)
    showPlayer()
  }

  const toggleDropdown = (podcastId: number) => {
    setExpandedPodcast(expandedPodcast === podcastId ? null : podcastId)
  }

  const markAsCompleted = async (podcastId: number) => {
    try {
      await updatePodcastCompletedStatus(podcastId)
      setPodcasts((prevPodcasts) =>
        prevPodcasts.map((podcast) => (podcast.id === podcastId ? { ...podcast, completed: true } : podcast)),
      )
    } catch (error) {
      console.error("Error marking podcast as completed:", error)
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
    return duration
  }

  const handleUpgradePress = async () => {
    // implement apple payments to upgrade the user
    // try {
    //   await Linking.openURL("https://auxiomai.com/pricing")
    // } catch (error) {
    //   console.error("Error opening pricing URL:", error)
    // }
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
              <View style={styles.emptyStateIcon}>
                <Ionicons name="headset-outline" size={64} color="#687076" />
              </View>
              <Text style={styles.emptyStateTitle}>No podcasts yet</Text>
              <Text style={styles.emptyStateSubtitle}>Your podcasts will appear here when available</Text>
              
              {user.plan === "free" && (
                <TouchableOpacity style={styles.upgradePrompt} 
                                  onPress={() => RevenueCatUI.presentPaywallIfNeeded({
                                                        requiredEntitlementIdentifier: "pro"
                                                      })} 
                                    activeOpacity={0.8}>
                  <Ionicons name="star-outline" size={20} color="#ffd900" />
                  <Text style={styles.upgradeText}>
                    Upgrade to our paid or plus plan to get a weekly podcast!
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            podcasts.map((podcast, index) => (
              <View key={podcast.id}>
                <TouchableOpacity
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
                    {/* Show red dot if NOT completed */}
                    {!podcast.completed && <View style={styles.unreadIndicator} />}
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
                    {/* <TouchableOpacity
                      style={styles.infoButton}
                      onPress={(e) => {
                        e.stopPropagation()
                        toggleDropdown(podcast.id)
                      }}
                    >
                      <Ionicons
                        name={expandedPodcast === podcast.id ? "chevron-up" : "chevron-down"}
                        size={20}
                        color="#687076"
                      />
                    </TouchableOpacity> */}

                    <TouchableOpacity style={styles.playButton} onPress={() => handlePodcastPress(podcast)}>
                      <Ionicons name="play" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>

                {/* Dropdown Information
                {expandedPodcast === podcast.id && (
                  <PodcastDropdown podcast={podcast} onClose={() => setExpandedPodcast(null)} />
                )} */}
              </View>
            ))
          )}
        </View>
      </ScrollView>

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
    paddingHorizontal: 32,
  },
  emptyStateIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#0f172a08",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: "#687076",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  upgradePrompt: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffd90015",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ffd90030",
    maxWidth: 320,
  },
  upgradeText: {
    fontSize: 15,
    color: "#0f172a",
    fontWeight: "500",
    marginLeft: 8,
    textAlign: "center",
    lineHeight: 20,
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
    backgroundColor: "#ffd900ff",
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
  infoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0f172a10",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  completedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#34C759",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
  },
})
