"use client"

import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { router, useLocalSearchParams } from "expo-router"
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  SafeAreaView,
  Linking,
  Dimensions,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"

const { width: screenWidth } = Dimensions.get("window")
const cardWidth = screenWidth * 0.7 // 70% of screen width

export default function ArticleDetailScreen() {
  const { articleData } = useLocalSearchParams()

  // Parse the article data from the navigation params
  const article = articleData ? JSON.parse(articleData as string) : null

  if (!article) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.container}>
          <ThemedText style={styles.errorText}>Article not found</ThemedText>
        </ThemedView>
      </SafeAreaView>
    )
  }

  const handleOpenLink = async (url: string) => {
    try {
      await Linking.openURL(url)
    } catch (error) {
      console.error("Failed to open URL:", error)
    }
  }

  const handleBackPress = () => {
    router.back()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAF8EC" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.placeholder} />
        </View>

        {/* Article Content */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Article Header */}
          <View style={styles.articleHeader}>
            {article.featured && (
              <View style={styles.featuredBadge}>
                <ThemedText style={styles.featuredBadgeText}>Featured</ThemedText>
              </View>
            )}
            <ThemedText style={styles.metaInfo}>
              {formatDate(article.date)} • {article.duration} min read
            </ThemedText>
            <ThemedText style={styles.headline}>{article.title}</ThemedText>
            <ThemedText style={styles.description}>{article.summary}</ThemedText>
          </View>

          {/* Topics Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="pricetag" size={20} color="#1F2937" />
              <ThemedText style={styles.sectionTitle}>Topics</ThemedText>
            </View>
            <View style={styles.tagsContainer}>
              {article.topics.map((topic: string, index: number) => (
                <View key={index} style={styles.topicTag}>
                  <ThemedText style={styles.topicTagText}>{topic}</ThemedText>
                </View>
              ))}
            </View>
          </View>

          {/* Tags Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bookmark" size={20} color="#1F2937" />
              <ThemedText style={styles.sectionTitle}>Tags</ThemedText>
            </View>
            <View style={styles.tagsContainer}>
              {article.tags.map((tag: string, index: number) => (
                <View key={index} style={styles.regularTag}>
                  <ThemedText style={styles.regularTagText}>{tag}</ThemedText>
                </View>
              ))}
            </View>
          </View>

          {/* Authors Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="people" size={20} color="#1F2937" />
              <ThemedText style={styles.sectionTitle}>Authors & Key Figures</ThemedText>
            </View>
            <View style={styles.authorsContent}>
              {article.people.map((person: string, index: number) => (
                <View key={index} style={styles.authorCard}>
                  <View style={styles.authorAvatar}>
                    <ThemedText style={styles.authorInitials}>
                      {person.split(" ").map((n: string) => n[0]).join("")}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.authorName}>{person}</ThemedText>
                </View>
              ))}
            </View>
          </View>

          {/* Article Analysis Section */}
          <View style={[styles.section, styles.lastSection]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="analytics" size={20} color="#1F2937" />
              <ThemedText style={styles.sectionTitle}>Article Analysis</ThemedText>
            </View>
            <View style={styles.storyContent}>
              <ThemedText style={styles.storyText}>
                This article covers key developments in {article.topics.join(", ").toLowerCase()}, featuring insights from {article.people.join(", ")}. 
                {"\n\n"}
                The analysis focuses on {article.tags.slice(0, 3).join(", ").toLowerCase()} and provides a comprehensive overview of the current situation and its potential implications.
                {"\n\n"}
                Key themes include policy implications, stakeholder perspectives, and potential future developments in this area.
              </ThemedText>
            </View>
          </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginTop: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "700",
    color: "#1F2937",
  },
  placeholder: {
    width: 32, // Same width as back button for centering
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  articleHeader: {
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginBottom: 24,
  },
  articleCount: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  headline: {
    color: "#1F2937",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
    lineHeight: 40,
  },
  description: {
    color: "#4B5563",
    fontSize: 18,
    lineHeight: 28,
  },
  section: {
    marginBottom: 32,
  },
  lastSection: {
    marginBottom: 40, // Extra margin for the last section
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#1F2937",
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 8,
  },
  storyContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  storyText: {
    color: "#374151",
    fontSize: 16,
    lineHeight: 28,
  },
  horizontalScrollContent: {
    paddingRight: 24, // Extra padding at the end
    paddingBottom: 8, // For shadows
  },
  documentCard: {
    width: cardWidth,
    backgroundColor: "#1F2937",
    borderRadius: 16,
    marginRight: 16,
    height: 180,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  documentContent: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  documentTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
    flex: 1,
  },
  documentFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  viewText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  newsCard: {
    width: cardWidth,
    backgroundColor: "#1F2937",
    borderRadius: 16,
    marginRight: 16,
    height: 180,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  newsContent: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  newsTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
    flex: 1,
  },
  newsFooter: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  newsSource: {
    color: "#9CA3AF",
    fontSize: 14,
    marginBottom: 8,
  },
  readArticleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  readArticleText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  readIcon: {
    marginLeft: 4,
  },
  errorText: {
    fontSize: 18,
    color: "#1F2937",
    textAlign: "center",
    marginTop: 50,
  },
  featuredBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  featuredBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  metaInfo: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  topicTag: {
    backgroundColor: "#DBEAFE",
    borderColor: "#93C5FD",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  topicTagText: {
    color: "#1E40AF",
    fontSize: 12,
    fontWeight: "600",
  },
  regularTag: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  regularTagText: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "500",
  },
  authorsContent: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  authorCard: {
    alignItems: "center",
    marginRight: 16,
    marginBottom: 16,
    width: 80,
  },
  authorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  authorInitials: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  authorName: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 16,
  },
})
