import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { router } from "expo-router"
import { useEffect, useState } from "react"
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native"
import { getArticles, getRecommendedArticles } from "@/lib/db/queries"
import { useAuth } from "@/lib/auth-context"
// Types for articles
export interface Article {
  id: number
  title: string
  summary: string
  content: string
  people: string[]
  topics: string[]
  tags: string[]
  date: string
  duration: number
  featured: boolean
  embedding: number[]
}

export default function FeedScreen() {
  const { user, loading } = useAuth()
  const [articles, setArticles] = useState<Article[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [articlesLoading, setArticlesLoading] = useState(false)
  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    const fetchArticles = async () => {
      
      try {
        setArticlesLoading(true)
        // Fetch articles
        let articlesData: Article[] = []
        if (user && user.embedding) {
          articlesData = await getRecommendedArticles(user.embedding)
        } else {
          articlesData = await getArticles()
        }
        setArticles(articlesData as Article[])
        setFilteredArticles(articlesData as Article[])
      } catch (error) {
        console.error("Error fetching articles:", error)
      } finally {
        setArticlesLoading(false)
      }
    }

    fetchArticles()
  }, [user])

  // Get all unique topics from articles for filtering
  const getAllTopics = (articles: Article[]) => {
    const allTopics = articles.flatMap(article => article.topics)
    return ["All", ...Array.from(new Set(allTopics)).sort()]
  }

  const topics = getAllTopics(articles)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    filterArticles(query, selectedTopics)
  }

  const handleTopicFilter = (topic: string) => {
    let newSelectedTopics: string[]
    
    if (topic === "All") {
      newSelectedTopics = []
    } else {
      const isSelected = selectedTopics.includes(topic)
      if (isSelected) {
        newSelectedTopics = selectedTopics.filter(t => t !== topic)
      } else {
        newSelectedTopics = [...selectedTopics, topic]
      }
    }
    
    setSelectedTopics(newSelectedTopics)
    filterArticles(searchQuery, newSelectedTopics)
  }

  const filterArticles = (query: string, selectedTopics: string[]) => {
    let filtered = articles
    
    if (selectedTopics.length > 0) {
      filtered = filtered.filter((article) =>
        selectedTopics.some(topic => article.topics.includes(topic))
      )
    }
    
    if (query) {
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(query.toLowerCase()) ||
          article.summary.toLowerCase().includes(query.toLowerCase()) ||
          article.people.some(person => person.toLowerCase().includes(query.toLowerCase())) ||
          article.topics.some(topic => topic.toLowerCase().includes(query.toLowerCase())) ||
          article.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      )
    }
    
    setFilteredArticles(filtered)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleCardPress = (article: Article) => {
    router.push({
      pathname: "/article-detail",
      params: {
        articleData: JSON.stringify(article),
      },
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Calculate pagination
  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedArticles = filteredArticles.slice(startIndex, endIndex)

  if (loading || !user || articlesLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ThemedText>Loading...</ThemedText>
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
              {user.name ? `${user.name.split(" ")[0]}'s Feed` : "Your Feed"}
            </ThemedText>
          </View>
        </View>

        {/* Articles Feed */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search articles, authors, or topics..."
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>

          {/* Topic Filter */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.topicContainer}
            contentContainerStyle={styles.topicContentContainer}
          >
            {topics.map((topic) => {
              const isSelected = topic === "All" ? selectedTopics.length === 0 : selectedTopics.includes(topic)
              return (
                <TouchableOpacity
                  key={topic}
                  style={[styles.topicButton, isSelected && styles.selectedTopicButton]}
                  onPress={() => handleTopicFilter(topic)}
                >
                  <ThemedText style={[styles.topicButtonText, isSelected && styles.selectedTopicButtonText]}>
                    {topic}
                  </ThemedText>
                </TouchableOpacity>
              )
            })}
          </ScrollView>

          {/* Results Info */}
          <View style={styles.resultsInfo}>
            <ThemedText style={styles.resultsText}>
              {filteredArticles.length > 0 ? (
                `Showing ${startIndex + 1}-${Math.min(endIndex, filteredArticles.length)} of ${filteredArticles.length} ${filteredArticles.length === 1 ? "article" : "articles"}`
              ) : (
                "0 articles"
              )}
              {selectedTopics.length > 0 && ` in ${selectedTopics.join(", ")}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </ThemedText>
          </View>

          {paginatedArticles.length === 0 ? (
            <View style={styles.noResultsContainer}>
              <ThemedText style={styles.noResultsTitle}>No articles found</ThemedText>
              <ThemedText style={styles.noResultsText}>
                Try adjusting your search terms or filters
              </ThemedText>
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => {
                  setSearchQuery("")
                  setSelectedTopics([])
                  setFilteredArticles(articles)
                }}
              >
                <ThemedText style={styles.clearFiltersButtonText}>Clear Filters</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            paginatedArticles.map((article, index) => (
              <TouchableOpacity
                key={article.id}
                style={[styles.articleCard, article.featured && styles.featuredCard]}
                onPress={() => handleCardPress(article)}
                activeOpacity={0.8}
              >
                <View style={styles.articleHeader}>
                  {/* Featured Badge */}
                  {article.featured && (
                    <View style={styles.featuredBadge}>
                      <ThemedText style={styles.featuredBadgeText}>Featured</ThemedText>
                    </View>
                  )}
                  
                  {/* Title */}
                  <ThemedText style={[
                    styles.headline, 
                    (index === 0 || article.featured) && styles.largerHeadline
                  ]}>
                    {article.title}
                  </ThemedText>
                  
                  {/* Summary */}
                  <ThemedText style={[
                    styles.description, 
                    (index === 0 || article.featured) && styles.largerDescription
                  ]}>
                    {article.summary}
                  </ThemedText>
                  
                  {/* Topics */}
                  <View style={styles.tagsContainer}>
                    {article.topics.slice(0, 3).map((topic, topicIndex) => (
                      <View key={topicIndex} style={styles.topicTag}>
                        <ThemedText style={styles.topicTagText}>{topic}</ThemedText>
                      </View>
                    ))}
                    {article.topics.length > 3 && (
                      <View style={styles.topicTag}>
                        <ThemedText style={styles.topicTagText}>
                          +{article.topics.length - 3} more
                        </ThemedText>
                      </View>
                    )}
                  </View>
                  
                  {/* Tags */}
                  <View style={styles.tagsContainer}>
                    {article.tags.slice(0, 4).map((tag, tagIndex) => (
                      <View key={tagIndex} style={styles.regularTag}>
                        <ThemedText style={styles.regularTagText}>{tag}</ThemedText>
                      </View>
                    ))}
                    {article.tags.length > 4 && (
                      <View style={styles.regularTag}>
                        <ThemedText style={styles.regularTagText}>
                          +{article.tags.length - 4}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                  
                  {/* Article Meta */}
                  <View style={styles.articleMeta}>
                    <View style={styles.authorsContainer}>
                      <ThemedText style={styles.authorsText}>
                        {article.people.join(", ")}
                      </ThemedText>
                    </View>
                    <View style={styles.metaInfo}>
                      <ThemedText style={styles.metaText}>{formatDate(article.date)}</ThemedText>
                      <ThemedText style={styles.metaText}> • {article.duration} min read</ThemedText>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
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
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginTop: 20,
  },
  logoContainer: {
    flexDirection: "row",
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
    color: "#1F2937",
    paddingTop: 10,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    height: 48,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  topicContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    maxHeight: 50,
  },
  topicContentContainer: {
    paddingVertical: 4,
  },
  topicButton: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    maxHeight: 38,
  },
  selectedTopicButton: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  topicButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  selectedTopicButtonText: {
    color: "#FFFFFF",
  },
  resultsInfo: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsText: {
    fontSize: 12,
    color: "#6B7280",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  clearFiltersButton: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  clearFiltersButtonText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  articleCard: {
    marginVertical: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  featuredCard: {
    borderWidth: 2,
    borderColor: "#3B82F6",
  },
  articleHeader: {
    padding: 20,
  },
  featuredBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  featuredBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  headline: {
    color: "#1F2937",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    lineHeight: 28,
  },
  largerHeadline: {
    fontSize: 24,
    lineHeight: 32,
  },
  description: {
    color: "#4B5563",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  largerDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  topicTag: {
    backgroundColor: "#DBEAFE",
    borderColor: "#93C5FD",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  topicTagText: {
    color: "#1E40AF",
    fontSize: 10,
    fontWeight: "500",
  },
  regularTag: {
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  regularTagText: {
    color: "#6B7280",
    fontSize: 10,
  },
  articleMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  authorsContainer: {
    flex: 1,
  },
  authorsText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 12,
    color: "#6B7280",
  },
})
