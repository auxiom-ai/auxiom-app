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
            <ThemedText style={styles.articleCount}>
              {article.articleCount} ARTICLES • {article.time}
            </ThemedText>
            <ThemedText style={styles.headline}>{article.headline}</ThemedText>
            <ThemedText style={styles.description}>{article.description}</ThemedText>
          </View>

          {/* Full Story Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="newspaper" size={20} color="#1F2937" />
              <ThemedText style={styles.sectionTitle}>Full Story</ThemedText>
            </View>
            <View style={styles.storyContent}>
              <ThemedText style={styles.storyText}>{article.fullStory}</ThemedText>
            </View>
          </View>

          {/* Government Documents Section - Horizontal Scrolling */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={20} color="#1F2937" />
              <ThemedText style={styles.sectionTitle}>Government Documents</ThemedText>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
              decelerationRate="fast"
              snapToInterval={cardWidth + 16}
              snapToAlignment="center"
            >
              {article.governmentDocuments.map((doc: any, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={styles.documentCard}
                  onPress={() => handleOpenLink(doc.url)}
                  activeOpacity={0.8}
                >
                  <View style={styles.documentContent}>
                    <ThemedText style={styles.documentTitle}>{doc.title}</ThemedText>
                    <View style={styles.documentFooter}>
                      <ThemedText style={styles.viewText}>View Document</ThemedText>
                      <Ionicons name="open-outline" size={16} color="#FFFFFF" />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Related News Section - Horizontal Scrolling */}
          <View style={[styles.section, styles.lastSection]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="library" size={20} color="#1F2937" />
              <ThemedText style={styles.sectionTitle}>Related News</ThemedText>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
              decelerationRate="fast"
              snapToInterval={cardWidth + 16}
              snapToAlignment="center"
            >
              {article.newsArticles.map((newsItem: any, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={styles.newsCard}
                  onPress={() => handleOpenLink(newsItem.url)}
                  activeOpacity={0.8}
                >
                  <View style={styles.newsContent}>
                    <ThemedText style={styles.newsTitle}>{newsItem.title}</ThemedText>
                    <View style={styles.newsFooter}>
                      <ThemedText style={styles.newsSource}>{newsItem.source}</ThemedText>
                      <View style={styles.readArticleContainer}>
                        <ThemedText style={styles.readArticleText}>Read article</ThemedText>
                        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={styles.readIcon} />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
})
