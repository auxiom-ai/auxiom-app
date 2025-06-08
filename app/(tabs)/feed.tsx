"use client"

import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { supabase } from "@/lib/supabase"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useEffect, useState } from "react"
import { Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from "react-native"

// Sample data for the feed
const feedData = [
  {
    id: 1,
    headline: "US-China Trade War Escalation and Tariff Adjustments",
    description:
      "US-China trade war escalates! Tariffs on Chinese low-value imports jump from 34% to 84%, effective April 9, 2025, in response to China's retaliation.",
    time: "36M AGO",
    articleCount: 5,
    fullStory:
      "The escalating trade tensions between the United States and China have reached a new peak with the implementation of significantly higher tariffs on Chinese imports. This move represents a 50 percentage point increase from the previous 34% rate, affecting a wide range of low-value consumer goods. The decision comes as a direct response to China's retaliatory measures implemented earlier this year. Economic analysts predict this will lead to higher consumer prices across multiple sectors, increased business operational costs, and potential supply chain disruptions. The tit-for-tat nature of these trade policies suggests further escalation may be on the horizon, with both nations showing little sign of backing down from their respective positions.",
    governmentDocuments: [
      {
        title:
          "Amendment to Reciprocal Tariffs and Updated Duties as Applied to Low-Value Imports From the People's Republic of China",
        url: "#",
      },
      {
        title: "Modifying Reciprocal Tariff Rates To Reflect Trading Partner Retaliation and Alignment",
        url: "#",
      },
    ],
    newsArticles: [
      {
        title: "Trump's China tariff shocks US importers. One CEO calls it 'end of the world'",
        source: "AP News",
        url: "#",
      },
      {
        title: "China hits back at US and will raise tariffs on American goods",
        source: "AP News",
        url: "#",
      },
      {
        title: "Trump trade war escalates as China raises retaliatory duties",
        source: "NBC News",
        url: "#",
      },
    ],
  },
  {
    id: 2,
    headline: "Federal Reserve Interest Rate Decision",
    description:
      "The Federal Reserve announces a 0.25% interest rate cut, marking the third consecutive reduction this year.",
    time: "2H AGO",
    articleCount: 7,
    fullStory:
      "In a closely watched decision, the Federal Reserve has announced a quarter-point reduction in the federal funds rate, bringing it to its lowest level since early 2023. This marks the third consecutive rate cut this year as the central bank attempts to stimulate economic growth amid concerns about slowing inflation and employment rates. Fed Chair Jerome Powell cited global economic uncertainties and domestic market volatility as key factors in the decision. The move is expected to lower borrowing costs for consumers and businesses, potentially boosting spending and investment. However, critics argue that the aggressive monetary policy could lead to asset bubbles and increased financial risk-taking.",
    governmentDocuments: [
      {
        title: "Federal Open Market Committee Meeting Minutes",
        url: "#",
      },
      {
        title: "Monetary Policy Implementation Guidelines",
        url: "#",
      },
    ],
    newsArticles: [
      {
        title: "Fed cuts rates again as inflation concerns mount",
        source: "Reuters",
        url: "#",
      },
      {
        title: "Interest rate decision impacts mortgage markets",
        source: "Wall Street Journal",
        url: "#",
      },
      {
        title: "Economic outlook remains uncertain after Fed decision",
        source: "CNN Business",
        url: "#",
      },
    ],
  },
  {
    id: 3,
    headline: "Climate Policy and Carbon Emission Standards",
    description:
      "New federal regulations set stricter carbon emission standards for manufacturing industries. Companies have 18 months to comply.",
    time: "1D AGO",
    articleCount: 4,
    fullStory:
      "The Environmental Protection Agency has unveiled comprehensive new regulations targeting carbon emissions from manufacturing sectors, representing the most significant environmental policy shift in over a decade. The new standards require a 40% reduction in carbon emissions by 2027, with interim targets beginning in 2026. Industries affected include steel production, chemical manufacturing, and automotive assembly. Companies that fail to meet the new standards face substantial penalties, including potential facility shutdowns. Environmental groups have praised the move as essential for meeting climate goals, while industry representatives warn of potential job losses and increased production costs that could be passed on to consumers.",
    governmentDocuments: [
      {
        title: "Updated Carbon Emission Standards for Industrial Sectors",
        url: "#",
      },
      {
        title: "Environmental Compliance Framework 2025",
        url: "#",
      },
    ],
    newsArticles: [
      {
        title: "New climate rules could reshape manufacturing",
        source: "Bloomberg",
        url: "#",
      },
      {
        title: "Industries prepare for stricter emission standards",
        source: "Financial Times",
        url: "#",
      },
      {
        title: "Environmental groups praise new carbon regulations",
        source: "The Guardian",
        url: "#",
      },
    ],
  },
]

export default function FeedScreen() {
  const [userName, setUserName] = useState<string>("")

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const userId = 30 // hardcoded for testing, same as other pages
        const { data, error } = await supabase.from("users").select("name").eq("id", userId).single()

        if (error) {
          console.error("Error fetching user name:", error)
          setUserName("User") // fallback name
        } else if (data?.name) {
          setUserName(data.name)
        } else {
          setUserName("User") // fallback if no name found
        }
      } catch (err) {
        console.error("Unexpected error fetching user name:", err)
        setUserName("User") // fallback name
      }
    }

    fetchUserName()
  }, [])

  const handleCardPress = (article: (typeof feedData)[0]) => {
    // Navigate to article detail page with article data
    router.push({
      pathname: "/article-detail",
      params: {
        articleData: JSON.stringify(article),
      },
    })
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAF8EC" />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.brainIcon}>
              <Image source={require("../../assets/auxiom-logo.png")} style={styles.logoImage} resizeMode="contain" />
            </View>
            <ThemedText style={styles.logoText}>Hello, {userName || "User"}</ThemedText>
          </View>
        </View>

        {/* Feed Content */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {feedData.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.articleCard}
              onPress={() => handleCardPress(item)}
              activeOpacity={0.8}
            >
              <View style={styles.articleHeader}>
                <ThemedText style={styles.articleCount}>
                  {item.articleCount} ARTICLES • {item.time}
                </ThemedText>
                <ThemedText style={styles.headline}>{item.headline}</ThemedText>
                <ThemedText style={styles.description}>{item.description}</ThemedText>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="radio" size={24} color="#1F2937" />
            <ThemedText style={styles.activeNavText}>News</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="compass-outline" size={24} color="#9CA3AF" />
            <ThemedText style={styles.navText}>Explore</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="search-outline" size={24} color="#9CA3AF" />
            <ThemedText style={styles.navText}>Search</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="person-outline" size={24} color="#9CA3AF" />
            <ThemedText style={styles.navText}>Profile</ThemedText>
          </TouchableOpacity>
        </View>
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
    marginTop: 40,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  brainIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  logoImage: {
    width: 36,
    height: 36,
  },
  logoText: {
    fontSize: 30,
    fontWeight: "700",
    color: "#1F2937",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
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
  articleHeader: {
    padding: 20,
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
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    lineHeight: 32,
  },
  description: {
    color: "#4B5563",
    fontSize: 16,
    lineHeight: 24,
  },
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  activeNavText: {
    color: "#1F2937",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  navText: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
})
