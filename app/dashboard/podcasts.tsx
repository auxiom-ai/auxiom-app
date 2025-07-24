import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { useEffect, useState } from "react"
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native"
import { useAuth } from "@/lib/auth-context"
import { getUserPodcasts } from "@/lib/actions"
import { updatePodcastListenedStatus } from "@/lib/db/queries"
import { useAudioPlayer, AudioSource } from 'expo-audio'

// Types for podcasts
export interface Podcast {
  id: number
  title: string
  episodeNumber: number
  date: string
  duration: string
  audioFileUrl: string
  listened: boolean
  clusters: { title: string; description: string; gov: string[]; news: string[] }[]
}

export default function PodcastsScreen() {
  const { user, loading } = useAuth()
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [refreshing, setRefreshing] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [podcastsLoading, setPodcastsLoading] = useState(true)
  const [playingPodcastId, setPlayingPodcastId] = useState<number | null>(null)
  const [currentAudioSource, setCurrentAudioSource] = useState<AudioSource | null>(null)
  const ITEMS_PER_PAGE = 10

  // Create audio player instance
  const player = useAudioPlayer(currentAudioSource)

  useEffect(() => {
    if (user) {
      loadPodcasts()
    }
  }, [user])

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (player.playing) {
        player.pause()
      }
    }
  }, [player])

  const loadPodcasts = async () => {
    try {
      setPodcastsLoading(true)
      const podcastData = await getUserPodcasts()
      // Sort podcasts by id in descending order
      const sortedPodcasts = podcastData.sort((a, b) => b.id - a.id)
      setPodcasts(sortedPodcasts)
    } catch (error) {
      console.error('Error loading podcasts:', error)
      Alert.alert('Error', 'Failed to load podcasts')
    } finally {
      setPodcastsLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadPodcasts()
    setRefreshing(false)
  }

  const handleLoadMore = () => {
    const totalPages = Math.ceil(podcasts.length / ITEMS_PER_PAGE)
    if (currentPage < totalPages && !loadingMore) {
      setLoadingMore(true)
      setTimeout(() => {
        setCurrentPage(prev => prev + 1)
        setLoadingMore(false)
      }, 500)
    }
  }

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent
    const paddingToBottom = 20
    
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      handleLoadMore()
    }
  }

  const playPodcast = async (podcast: Podcast) => {
    try {
      if (playingPodcastId === podcast.id && player.playing) {
        // If same podcast is playing, pause it
        player.pause()
        setPlayingPodcastId(null)
        return
      }

      // Set new audio source and play
      setCurrentAudioSource({ uri: podcast.audioFileUrl })
      setPlayingPodcastId(podcast.id)
      
      // Start playing
      player.play()

    } catch (error) {
      console.error('Error playing podcast:', error)
      Alert.alert('Error', 'Failed to play podcast')
    }
  }

  // Monitor when audio finishes to mark as listened
  useEffect(() => {
    if (player.duration > 0 && player.currentTime >= player.duration) {
      if (playingPodcastId) {
        markAsListened(playingPodcastId)
        setPlayingPodcastId(null)
      }
    }
  }, [player.currentTime, player.duration, playingPodcastId])

  const markAsListened = async (podcastId: number) => {
    try {
      await updatePodcastListenedStatus(podcastId)
      // Update local state
      setPodcasts(prevPodcasts => 
        prevPodcasts.map(podcast => 
          podcast.id === podcastId ? { ...podcast, listened: true } : podcast
        )
      )
    } catch (error) {
      console.error('Error marking podcast as listened:', error)
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

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Calculate pagination
  const totalPages = Math.ceil(podcasts.length / ITEMS_PER_PAGE)
  const startIndex = 0
  const endIndex = currentPage * ITEMS_PER_PAGE
  const paginatedPodcasts = podcasts.slice(startIndex, endIndex)
  const hasMorePodcasts = currentPage < totalPages

  if (loading || !user || podcastsLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0f172a" />
            <ThemedText style={styles.loadingText}>Loading podcasts...</ThemedText>
          </View>
        </ThemedView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAF8EC" />
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.brainIcon}>
              <Image 
                source={require("@/assets/auxiom-logo.png")} 
                style={styles.logoImage} 
                resizeMode="contain" 
              />
            </View>
            <ThemedText style={styles.logoText}>
              {user.name ? `${user.name.split(" ")[0]}'s Podcasts` : "Your Podcasts"}
            </ThemedText>
          </View>
        </View>

        {/* Podcasts Feed */}
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={400}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#0f172a"
              colors={["#0f172a"]}
            />
          }
        >
          {/* Results Info */}
          <View style={styles.resultsInfo}>
            <ThemedText style={styles.resultsText}>
              {podcasts.length > 0 ? (
                `Showing ${startIndex + 1}-${Math.min(endIndex, podcasts.length)} of ${podcasts.length} ${podcasts.length === 1 ? "podcast" : "podcasts"}`
              ) : (
                "0 podcasts"
              )}
            </ThemedText>
          </View>

          {paginatedPodcasts.length === 0 ? (
            <View style={styles.noResultsContainer}>
              <ThemedText style={styles.noResultsTitle}>No podcasts available</ThemedText>
              <ThemedText style={styles.noResultsText}>
                Podcasts will appear here once they are available
              </ThemedText>
            </View>
          ) : (
            paginatedPodcasts.map((podcast) => (
              <View key={podcast.id} style={styles.podcastCard}>
                <View style={styles.podcastHeader}>
                  {/* Listened Badge */}
                  {podcast.listened && (
                    <View style={styles.listenedBadge}>
                      <ThemedText style={styles.listenedBadgeText}>✓ Listened</ThemedText>
                    </View>
                  )}
                  
                  {/* Title and Episode */}
                  <ThemedText style={styles.podcastTitle}>
                    Episode {podcast.episodeNumber}: {podcast.title}
                  </ThemedText>
                  
                  {/* Clusters Preview */}
                  {podcast.clusters.length > 0 && (
                    <View style={styles.clustersPreview}>
                      <ThemedText style={styles.clustersTitle}>Featured Topics:</ThemedText>
                      {podcast.clusters.slice(0, 2).map((cluster, index) => (
                        <View key={index} style={styles.clusterItem}>
                          <ThemedText style={styles.clusterItemTitle}>{cluster.title}</ThemedText>
                          <ThemedText style={styles.clusterItemDescription}>
                            {cluster.description.length > 100 
                              ? `${cluster.description.substring(0, 100)}...` 
                              : cluster.description}
                          </ThemedText>
                        </View>
                      ))}
                      {podcast.clusters.length > 2 && (
                        <ThemedText style={styles.moreTopicsText}>
                          +{podcast.clusters.length - 2} more topics
                        </ThemedText>
                      )}
                    </View>
                  )}
                  
                  {/* Audio Player */}
                  <View style={styles.audioPlayerContainer}>
                    <TouchableOpacity
                      style={styles.playButton}
                      onPress={() => playPodcast(podcast)}
                    >
                      <ThemedText style={styles.playButtonText}>
                        {playingPodcastId === podcast.id && player.playing ? "⏸️" : "▶️"}
                      </ThemedText>
                    </TouchableOpacity>
                    
                    <View style={styles.audioInfo}>
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          <View 
                            style={[
                              styles.progressFill, 
                              { 
                                width: playingPodcastId === podcast.id && player.duration > 0 
                                  ? `${(player.currentTime / player.duration) * 100}%` 
                                  : '0%' 
                              }
                            ]} 
                          />
                        </View>
                      </View>
                      <View style={styles.timeContainer}>
                        <ThemedText style={styles.timeText}>
                          {playingPodcastId === podcast.id 
                            ? `${formatTime(player.currentTime * 1000)} / ${formatTime(player.duration * 1000)}` 
                            : podcast.duration}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                  
                  {/* Podcast Meta */}
                  <View style={styles.podcastMeta}>
                    <ThemedText style={styles.metaText}>{formatDate(podcast.date)}</ThemedText>
                    <TouchableOpacity 
                      onPress={() => markAsListened(podcast.id)}
                      disabled={podcast.listened}
                    >
                      <ThemedText style={[
                        styles.markListenedText,
                        podcast.listened && styles.markListenedTextDisabled
                      ]}>
                        {podcast.listened ? "Listened" : "Mark as Listened"}
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}

          {/* Loading More Indicator */}
          {loadingMore && hasMorePodcasts && (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color="#0f172a" />
              <ThemedText style={styles.loadingMoreText}>Loading more podcasts...</ThemedText>
            </View>
          )}

          {/* End of Feed Message */}
          {!hasMorePodcasts && podcasts.length > ITEMS_PER_PAGE && (
            <View style={styles.endOfFeedContainer}>
              <ThemedText style={styles.endOfFeedText}>
                You've reached the end of your podcasts
              </ThemedText>
            </View>
          )}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAF8EC",
  },
  container: {
    flex: 1,
    backgroundColor: "#FAF8EC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 10,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#0f172a20",
    marginTop: 20,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  brainIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  logoImage: {
    width: 36,
    height: 36,
  },
  logoText: {
    fontSize: 30,
    fontWeight: "700",
    color: "#0f172a",
    paddingTop: 10,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultsInfo: {
    paddingVertical: 8,
  },
  resultsText: {
    fontSize: 12,
    color: "#0f172a80",
  },
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: "#0f172a80",
    marginBottom: 16,
  },
  podcastCard: {
    marginVertical: 12,
    backgroundColor: "#0f172a15",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#0f172a",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "#0f172a20",
  },
  podcastHeader: {
    padding: 20,
  },
  listenedBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#22c55e",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  listenedBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  podcastTitle: {
    color: "#0f172a",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    lineHeight: 28,
  },
  clustersPreview: {
    marginBottom: 16,
  },
  clustersTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 8,
  },
  clusterItem: {
    marginBottom: 8,
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#0f172a30",
  },
  clusterItemTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 2,
  },
  clusterItemDescription: {
    fontSize: 11,
    color: "#0f172a70",
    lineHeight: 16,
  },
  moreTopicsText: {
    fontSize: 11,
    color: "#0f172a60",
    fontStyle: "italic",
    marginTop: 4,
  },
  audioPlayerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#0f172a20",
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  playButtonText: {
    fontSize: 20,
    color: "#FAF8EC",
  },
  audioInfo: {
    flex: 1,
  },
  progressContainer: {
    marginBottom: 6,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#0f172a20",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#0f172a",
    borderRadius: 2,
  },
  timeContainer: {
    alignItems: "flex-end",
  },
  timeText: {
    fontSize: 12,
    color: "#0f172a70",
  },
  podcastMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#0f172a30",
  },
  metaText: {
    fontSize: 12,
    color: "#0f172a70",
  },
  markListenedText: {
    fontSize: 12,
    color: "#0f172a",
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  markListenedTextDisabled: {
    color: "#0f172a50",
    textDecorationLine: "none",
  },
  loadingMoreContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingMoreText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#0f172a80",
  },
  endOfFeedContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  endOfFeedText: {
    fontSize: 14,
    color: "#0f172a60",
    fontStyle: "italic",
  },
})
