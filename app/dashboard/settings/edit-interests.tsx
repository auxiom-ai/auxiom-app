"use client"

import type React from "react"
import { useState, useRef, useMemo, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Fuse from "fuse.js"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"

import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { updateUserInterests } from '@/lib/actions'
import { useAuth } from '@/lib/auth-context'

const SUGGESTED_INTERESTS = Array.from(new Set([
  "Climate",
  "Trade",
  "Energy",
  "Cybersecurity",
  "Technology",
  "Economics",
  "Voting",
  "International Relations",
  "Public Health",
  "Immigration",
  "Media",
  "Inequality",
  "Healthcare",
  "Finance",
  "Space",
  "Arms Control",
  "Education",
  "Civil Rights",
  "Equality",
  "Global Trade",
  "Misinformation",
  "Urban Planning",
  "Human Rights",
  "Political Trends",
  "Corporate Influence",
  "Infrastructure",
  "Food Security",
  "Water Resources",
  "Economic Agreements",
  "Gun Laws",
  "Housing",
  "Labor",
  "Transportation",
  "Indigenous Issues",
  "Taxation",
  "Law Enforcement",
  "Drugs",
  "Justice System",
  "Religious Rights",
  "Science",
  "Diversity",
  "Conservation",
  "Digital Privacy",
  "Corporate Law",
  "Election Security",
  "Transparency",
  "National Security",
  "Media Regulation",
  "Biodiversity",
  "Wages",
  "Rural Development",
  "Child Welfare",
  "Healthcare Access",
  "Education Standards",
  "Civic Engagement",
  "Globalization",
  "Energy Markets",
  "Automation",
  "Campaign Finance",
  "Veterans",
  "Corporate Taxes",
  "Statehood",
  "Climate Change",
  "Free Speech",
  "Government Spending",
  "Food Safety",
  "Mental Health",
  "Diplomacy",
  "AI Ethics",
  "Consumer Safety",
  "Animal Welfare",
  "Foreign Aid",
  "Legal Systems",
  "Housing Access",
  "Nuclear Issues",
  "Education Reform",
  "Workplace Rights",
  "Family Policy",
  "Crime & Sentencing",
  "Healthcare Costs",
  "Substance Use",
  "Land Use",
  "Government Ethics",
  "Tech Regulation",
  "Death Penalty",
  "Consumer Rights",
  "Wildlife Protection",
  "Research Funding",
  "Economic Justice",
  "Governance",
  "Courts & Law",
  "Social Welfare",
  "Waste Management",
  "Political Expression",
  "Digital Economy",
  "Rural Policy",
  "United States",
  "China",
  "European Union",
  "Middle East",
  "Russia",
  "Latin America",
  "India",
  "Africa",
  "Japan",
  "South Korea",
  "Australia",
  "Canada",
  "Brazil",
  "Germany",
  "United Kingdom",
  "France",
  "Italy",
  "Scandinavia",
  "Domestic Policy",
  "Foreign Policy",
  "Social Issues",
  "Economic Issues",
  "Environment",
  "Tech Policy",
  "Law",
  "International Affairs",
  "Public Policy",
  "Political Movements",
  "Arts & Culture",
  "Community",
  "Disability Rights",
  "Aging & Elder Care",
  "Entertainment",
  "Firearms",
  "Gambling",
  "Genetics",
  "Government Budget",
  "Higher Education",
  "Intellectual Property",
  "Judicial Appointments",
  "Lobbying",
  "Military Spending",
  "Wages & Employment",
  "Monetary Policy",
  "Natural Resources",
  "Nonprofits",
  "Energy Production",
  "Public Safety",
  "Patents",
  "Police",
  "Poverty",
  "Privacy",
  "Public Media",
  "Refugees",
  "Renewable Energy",
  "Reproductive Rights",
  "School Choice",
  "Small Business",
  "Social Security",
  "Space Exploration",
  "Sports",
  "Surveillance",
  "Tourism",
  "Trade Deals",
  "Indigenous Rights",
  "Unemployment",
  "Basic Income",
  "Vaccines",
  "Voting Rights",
  "Wealth Distribution",
  "Worker Safety",
  "Youth Issues",
  "Agriculture",
  "Border Control",
  "Coastal Management",
  "Decolonization",
  "Cryptocurrency",
  "Migration",
  "Economy",
  "Inflation",
  "Health",
  "Abortion",
  "Tax Reform",
  "National Debt",
  "Populism",
  "Authoritarianism",
  "Disinformation",
  "Social Justice",
  "Discrimination",
  "Feminism",
  "LGBTQ+ Rights",
  "Nationalism",
  "Trade Wars",
  "Nuclear Weapons",
  "Censorship",
  "Capitalism",
  "Socialism",
  "Communism",
  "Fascism",
  "Democracy",
  "Monarchy",
  "Oligarchy",
  "Terrorism",
  "Refugee Issues",
  "Sanctions",
  "War Crimes",
  "Genocide",
  "Disarmament",
  "NATO",
  "UN",
  "European Politics",
  "Brexit",
  "Secession",
  "Federalism",
  "State Rights",
  "Gun Rights",
  "Protest Laws",
  "Unions",
  "Wealth Tax",
  "Banking",
  "Crypto",
  "Biotech",
  "Scientific Innovation",
  "End-of-Life Rights",
  "Prison Reform",
  "Police Brutality",
  "Racial Profiling",
  "Affirmative Action",
  "Education Access",
  "Meritocracy",
  "Economic Class",
  "Public Schools",
  "Charter Schools",
  "Student Debt",
  "Debt Relief",
  "Bankruptcy",
  "Antitrust",
  "Monopolies",
  "Regulatory Oversight",
  "Voter ID",
  "Gerrymandering",
  "Election Methods",
  "Democratic Reform",
  "Constitutional Law",
  "Impeachment",
  "Tariffs",
  "Domestic Labor",
  "Foreign Labor",
  "Labor Rights",
]))

// Function to calculate similarity between two strings (same as original)
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase()
  const s2 = str2.toLowerCase()

  const words1 = s1.split(/\s+/)
  const words2 = s2.split(/\s+/)

  let wordMatchCount = 0
  for (const word1 of words1) {
    if (word1.length < 3) continue
    for (const word2 of words2) {
      if (word2.length < 3) continue
      if (word1 === word2 || word1.includes(word2) || word2.includes(word1)) {
        wordMatchCount++
      }
    }
  }

  let charMatchCount = 0
  for (let i = 0; i < s1.length - 2; i++) {
    const trigram = s1.substring(i, i + 3)
    if (s2.includes(trigram)) {
      charMatchCount++
    }
  }

  return wordMatchCount * 3 + charMatchCount
}

// Interest tag component
const InterestTag: React.FC<{ keyword: string; onRemove: (keyword: string) => void }> = ({ keyword, onRemove }) => (
  <ThemedView style={styles.tag}>
    <ThemedText style={styles.tagText}>{keyword}</ThemedText>
    <TouchableOpacity
      onPress={() => onRemove(keyword)}
      style={styles.removeButton}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="close" size={14} color="#FAF8EC" />
    </TouchableOpacity>
  </ThemedView>
)

// Suggestion item component
const SuggestionItem: React.FC<{ suggestion: string; onPress: (suggestion: string) => void }> = ({
  suggestion,
  onPress,
}) => (
  <TouchableOpacity style={styles.suggestionItem} onPress={() => onPress(suggestion)}>
    <Ionicons name="add" size={12} color="#0f172a" style={styles.suggestionIcon} />
    <ThemedText style={styles.suggestionText}>{suggestion}</ThemedText>
  </TouchableOpacity>
)

export default function EditInterestsScreen() {
  const { user, refetchUser } = useAuth()
  const [keywords, setKeywords] = useState<string[]>([])
  const [inputValue, setInputValue] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const inputRef = useRef<TextInput>(null)

  // Initialize Fuse.js with stronger fuzziness
  const fuse = useMemo(() => new Fuse(SUGGESTED_INTERESTS, { threshold: 0.4, distance: 100 }), [])

  // Load existing user interests on component mount
  useEffect(() => {
    if (user?.keywords) {
      setKeywords([...user.keywords])
    }
    setIsLoading(false)
  }, [user])

  // Get dynamic suggestions based on current interests
  const dynamicSuggestions = useMemo(() => {
    if (keywords.length === 0) {
      return SUGGESTED_INTERESTS
    }

    const scoredSuggestions = SUGGESTED_INTERESTS.filter((suggestion) => !keywords.includes(suggestion)).map(
      (suggestion) => {
        let totalScore = 0
        for (const keyword of keywords) {
          totalScore += calculateSimilarity(keyword, suggestion)
        }
        return { suggestion, score: totalScore }
      },
    )

    return scoredSuggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((item) => item.suggestion)
  }, [keywords])

  const handleInputChange = (text: string) => {
    setInputValue(text)
    if (text.trim()) {
      const filtered = fuse
        .search(text)
        .map((result) => result.item)
        .filter((interest) => !keywords.includes(interest))
      
      // Add the search query itself as the first option if it's not already selected
      // and doesn't exactly match any of the filtered suggestions
      const searchQuery = text.trim()
      const suggestionsToShow = []
      
      if (!keywords.includes(searchQuery) && 
          !filtered.some(interest => interest.toLowerCase() === searchQuery.toLowerCase())) {
        suggestionsToShow.push(searchQuery)
      }
      
      // Add the filtered predefined interests
      suggestionsToShow.push(...filtered)
      
      setSuggestions(suggestionsToShow)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const addInterest = (interest: string) => {
    if (interest.trim() && !keywords.includes(interest)) {
      setKeywords([...keywords, interest])
      setInputValue("")
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const removeInterest = (interest: string) => {
    setKeywords(keywords.filter((i) => i !== interest))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await updateUserInterests(keywords)
      
      // Refetch user to update the context with new interests
      await refetchUser()

      Alert.alert("Success", "Your interests have been updated successfully!", [
        {
          text: "OK",
          onPress: () => router.back()
        }
      ])
    } catch (error) {
      console.error("Error updating interests:", error)
      Alert.alert("Error", "Failed to update your interests. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>Loading your interests...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        {/* Header Section */}
        <ThemedView style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="#0f172a" />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>Edit your interests</ThemedText>
          <ThemedText style={styles.subtitle}>Update the topics you want to stay informed about.</ThemedText>
        </ThemedView>

        {/* Main Content */}
        <ThemedView style={styles.content}>
          <ThemedView style={styles.interestsContainer}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>I want my podcasts to be about...</ThemedText>

            {/* Selected Interests */}
            <View style={styles.tagsContainer}>
              <View style={styles.tagsList}>
                {keywords.map((item, index) => (
                  <InterestTag key={`${item}-${index}`} keyword={item} onRemove={removeInterest} />
                ))}
              </View>

              {/* Input Field */}
              <View style={styles.inputContainer}>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  placeholder={keywords.length === 0 ? "Search interest..." : "Search another interest..."}
                  placeholderTextColor="#9CA3AF"
                  value={inputValue}
                  onChangeText={handleInputChange}
                  onSubmitEditing={() => addInterest(inputValue)}
                  returnKeyType="done"
                  onFocus={() => setShowSuggestions(true)}
                />
                <TouchableOpacity style={styles.addButton} onPress={() => addInterest(inputValue)}>
                  <Ionicons name="add" size={14} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <View style={styles.suggestionsDropdown}>
                <ScrollView style={styles.dropdownList} keyboardShouldPersistTaps="handled">
                  {suggestions.map((item, index) => (
                    <TouchableOpacity key={`suggestion-${item}-${index}`} style={styles.dropdownItem} onPress={() => addInterest(item)}>
                      <Text style={styles.dropdownText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </ThemedView>

          {/* Dynamic Suggestions */}
          <ThemedView style={styles.suggestionsSection}>
            <ThemedText style={styles.suggestionsTitle}>
              {keywords.length > 0 ? "Related interests" : "Suggested interests"}
            </ThemedText>
            <View style={styles.suggestionsList}>
              {dynamicSuggestions.slice(0, 10).filter((interest) => !keywords.includes(interest)).map((item, index) => (
                <SuggestionItem key={`dynamic-${item}-${index}`} suggestion={item} onPress={addInterest} />
              ))}
            </View>
          </ThemedView>

          {/* Submit Button */}
          <ThemedView style={styles.submitContainer}>
            <TouchableOpacity
              style={[styles.submitButton]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <ThemedText style={styles.submitButtonText}>
                {isSubmitting ? "Updating..." : "Update Interests"}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF8EC",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 32,
    left: 24,
    zIndex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 16,
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    color: "#0f172a80",
    lineHeight: 24,
  },
  content: {
    paddingHorizontal: 16,
  },
  interestsContainer: {
    backgroundColor: "#0f172a15",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#0f172a20",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 16,
  },
  tagsContainer: {
    marginBottom: 16,
  },
  tagsList: {
    marginBottom: 16,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#0f172a",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    margin: 4,
    alignSelf: "flex-start",
  },
  tagText: {
    color: "#FAF8EC",
    fontSize: 14,
    fontWeight: "500",
    marginRight: 4,
  },
  removeButton: {
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignSelf: "flex-start",
    minWidth: 200,
    borderWidth: 1,
    borderColor: "#0f172a20",
  },
  input: {
    color: "#0f172a",
    fontSize: 16,
    flex: 1,
    paddingVertical: 0,
  },
  addButton: {
    marginLeft: 8,
  },
  suggestionsDropdown: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#0f172a20",
    maxHeight: 200,
    marginTop: 8,
    shadowColor: "#0f172a",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  dropdownList: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#0f172a10",
  },
  dropdownText: {
    fontSize: 14,
    color: "#0f172a",
  },
  suggestionsSection: {
    marginBottom: 24,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a80",
    marginBottom: 12,
  },
  suggestionsList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#0f172a30",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 4,
    alignSelf: "flex-start",
  },
  suggestionIcon: {
    marginRight: 6,
  },
  suggestionText: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: "500",
  },
  submitContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  submitButton: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
    minWidth: 160,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FAF8EC",
    fontSize: 16,
    fontWeight: "600",
  },
})
