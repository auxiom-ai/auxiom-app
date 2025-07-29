"use client"

import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import type { Podcast } from "@/app/dashboard/podcasts"

interface PodcastDropdownProps {
  podcast: Podcast
  onClose: () => void
}

export default function PodcastDropdown({ podcast, onClose }: PodcastDropdownProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleArticlePress = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url)
      if (supported) {
        await Linking.openURL(url)
      } else {
        console.log("Cannot open URL:", url)
      }
    } catch (error) {
      console.error("Error opening URL:", error)
    }
  }

  const getAllArticles = () => {
    const articles: Array<{ title: string; description: string; url: string; type: string }> = []

    podcast.clusters.forEach((cluster) => {
      // Add government articles
      cluster.gov.forEach((govArticle) => {
        try {
          const parsed = JSON.parse(govArticle)
          articles.push({
            title: parsed.title || "Government Article",
            description: parsed.description || parsed.summary || "No description available",
            url: parsed.url || parsed.link || "#",
            type: "Government",
          })
        } catch (e) {
          // If it's not JSON, treat as plain text
          articles.push({
            title: "Government Article",
            description: govArticle,
            url: "#",
            type: "Government",
          })
        }
      })

      // Add news articles
      cluster.news.forEach((newsArticle) => {
        try {
          const parsed = JSON.parse(newsArticle)
          articles.push({
            title: parsed.title || "News Article",
            description: parsed.description || parsed.summary || "No description available",
            url: parsed.url || parsed.link || "#",
            type: "News",
          })
        } catch (e) {
          // If it's not JSON, treat as plain text
          articles.push({
            title: "News Article",
            description: newsArticle,
            url: "#",
            type: "News",
          })
        }
      })
    })

    return articles
  }

  const articles = getAllArticles()

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Episode Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Episode Details</Text>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#687076" />
            <Text style={styles.detailText}>Published: {formatDate(podcast.date)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#687076" />
            <Text style={styles.detailText}>Duration: {podcast.duration}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="headset-outline" size={16} color="#687076" />
            <Text style={styles.detailText}>Status: {podcast.completed ? "Listened" : "Not listened"}</Text>
          </View>
        </View>

        {/* Episode Title */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Episode Title</Text>
          <Text style={styles.episodeTitle}>{podcast.title}</Text>
        </View>

        {/* Articles in Episode */}
        {articles.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Articles in this Episode ({articles.length})</Text>
            {articles.slice(0, 5).map((article, index) => (
              <TouchableOpacity
                key={index}
                style={styles.articleItem}
                onPress={() => handleArticlePress(article.url)}
                disabled={article.url === "#"}
              >
                <View style={styles.articleHeader}>
                  <View style={styles.articleTypeContainer}>
                    <Ionicons
                      name={article.type === "Government" ? "business-outline" : "newspaper-outline"}
                      size={14}
                      color={article.type === "Government" ? "#0f172a" : "#687076"}
                    />
                    <Text
                      style={[styles.articleType, article.type === "Government" ? styles.govType : styles.newsType]}
                    >
                      {article.type}
                    </Text>
                  </View>
                  {article.url !== "#" && <Ionicons name="open-outline" size={14} color="#687076" />}
                </View>
                <Text style={styles.articleTitle} numberOfLines={2}>
                  {article.title}
                </Text>
                <Text style={styles.articleDescription} numberOfLines={3}>
                  {article.description}
                </Text>
              </TouchableOpacity>
            ))}
            {articles.length > 5 && (
              <Text style={styles.moreArticles}>+{articles.length - 5} more articles covered</Text>
            )}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={16} color="#0f172a" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="download-outline" size={16} color="#0f172a" />
              <Text style={styles.actionText}>Download</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="bookmark-outline" size={16} color="#0f172a" />
              <Text style={styles.actionText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FAF8EC",
    marginHorizontal: 20,
    marginTop: -4,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#0f172a20",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailText: {
    fontSize: 13,
    color: "#687076",
    marginLeft: 8,
  },
  episodeTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#0f172a",
    lineHeight: 20,
  },
  articleItem: {
    marginBottom: 12,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#0f172a30",
    backgroundColor: "#0f172a05",
    borderRadius: 8,
  },
  articleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  articleTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  articleType: {
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 4,
    textTransform: "uppercase",
  },
  govType: {
    color: "#0f172a",
  },
  newsType: {
    color: "#687076",
  },
  articleTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 4,
    lineHeight: 18,
  },
  articleDescription: {
    fontSize: 12,
    color: "#687076",
    lineHeight: 16,
  },
  moreArticles: {
    fontSize: 12,
    color: "#687076",
    fontStyle: "italic",
    marginTop: 4,
    textAlign: "center",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#0f172a10",
    borderRadius: 8,
  },
  actionText: {
    fontSize: 12,
    color: "#0f172a",
    fontWeight: "500",
    marginLeft: 4,
  },
})
