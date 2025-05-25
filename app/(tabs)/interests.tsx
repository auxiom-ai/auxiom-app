"use client"

import { supabase } from "@/lib/supabase"
import { Feather } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useRouter } from "expo-router"
import Fuse from "fuse.js"
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Alert, Image, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from "react-native"
import { Button, DefaultTheme, Provider as PaperProvider, Text, TextInput } from "react-native-paper"

// Import the policy map
const policyMap: Record<string, string[]> = require("@/assets/policy-subject-map-116-119.json")

// Get all policy areas (top-level categories)
const POLICY_AREAS = Object.keys(policyMap)

// Flatten every subject term into one master array (deduped + sorted)
const ALL_SUBJECT_TERMS: string[] = Array.from(new Set(Object.values(policyMap).flat() as string[])).sort()

// All searchable terms (policy areas + legislative areas)
// Ensure uniqueness by using a Set
const ALL_SEARCHABLE_TERMS = Array.from(new Set([...POLICY_AREAS, ...ALL_SUBJECT_TERMS]))

// ---- similarity helper (unchanged) -------------------------------------
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase()
  const s2 = str2.toLowerCase()
  const words1 = s1.split(/\s+/)
  const words2 = s2.split(/\s+/)
  let wordMatchCount = 0
  for (const w1 of words1) {
    if (w1.length < 3) continue
    for (const w2 of words2) {
      if (w2.length < 3) continue
      if (w1 === w2 || w1.includes(w2) || w2.includes(w1)) wordMatchCount++
    }
  }
  let charMatchCount = 0
  for (let i = 0; i < s1.length - 2; i++) {
    const trigram = s1.substring(i, i + 3)
    if (s2.includes(trigram)) charMatchCount++
  }
  return wordMatchCount * 3 + charMatchCount
}

// ---- custom theme (updated to match Auxiom light theme) -------------
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#4A6FA5", // Auxiom primary blue
    accent: "#E8B64C", // Auxiom accent gold
    background: "#FAF8EC", // Auxiom light background
  },
}

// Custom Tag component
type TagProps = {
  tag: string
  isSelected: boolean
  onToggle: () => void
  isSuggested?: boolean
}

const Tag = ({ tag, isSelected, onToggle, isSuggested = false }: TagProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.tag,
        isSelected ? styles.selectedTag : styles.unselectedTag,
        { minWidth: 40 + tag.length * 8 }, // Dynamic width based on text length
      ]}
      onPress={onToggle}
    >
      <View style={styles.tagContent}>
        {isSuggested && <View style={styles.suggestedIndicator} />}
        <Text style={[styles.tagText, isSelected && styles.selectedTagText]} numberOfLines={1} ellipsizeMode="tail">
          {tag}
        </Text>
        <Feather
          name={isSelected ? "x" : "plus"}
          size={16}
          color={isSelected ? "#FAF8EC" : "#333"}
          style={styles.tagIcon}
        />
      </View>
    </TouchableOpacity>
  )
}

// Search Result component
type SearchResultProps = {
  result: string
  isSelected: boolean
  onAdd: () => void
  index: number // Add index to ensure unique keys
}

const SearchResult = ({ result, isSelected, onAdd, index }: SearchResultProps) => {
  return (
    <TouchableOpacity style={styles.searchResult} onPress={onAdd}>
      <Text style={styles.searchResultText}>{result}</Text>
      <Feather name={isSelected ? "check" : "plus"} size={18} color={isSelected ? "#4A6FA5" : "#4A6FA5"} />
    </TouchableOpacity>
  )
}

// Type for tag with suggestion info
type TagWithSuggestions = {
  id: string // Unique identifier
  tag: string
  isSuggested: boolean
  suggestedBy?: string // The tag that suggested this one
  isSelected: boolean
}

export default function InterestsScreen() {
  // hide this tab
  const navigation = useNavigation()
  const router = useRouter()
  useLayoutEffect(() => {
    navigation.setOptions({ tabBarButton: () => null })
  }, [navigation])

  const [keywords, setKeywords] = useState<string[]>([])
  const [mostRecentKeyword, setMostRecentKeyword] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState("")
  const [searchResults, setSearchResults] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("suggested")
  const [allTags, setAllTags] = useState<TagWithSuggestions[]>([])
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set())
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<any>(null)

  // ---- fuzzy search over ALL_SUBJECT_TERMS -----------------------------
  const fuse = useMemo(
    () =>
      new Fuse(ALL_SEARCHABLE_TERMS, {
        threshold: 0.4,
        distance: 100,
        includeScore: true,
        ignoreLocation: true,
      }),
    [],
  )

  // Find which policy area a legislative area belongs to
  const findPolicyForLegislativeArea = (area: string): string | null => {
    for (const [policy, areas] of Object.entries(policyMap)) {
      if (areas.includes(area)) {
        return policy
      }
    }
    return null
  }

  // Get semantically similar tags for a specific tag
  const getSimilarTags = (tag: string, count = 3, excludeTags: string[] = []): string[] => {
    let similarTags: string[] = []

    if (POLICY_AREAS.includes(tag)) {
      // If it's a policy area, suggest legislative areas from that policy
      const areas = policyMap[tag].filter((area) => !excludeTags.includes(area))

      // Sort by similarity to the tag
      similarTags = areas
        .map((area) => ({ area, score: calculateSimilarity(tag, area) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, count)
        .map((item) => item.area)
    } else {
      // If it's a legislative area, find semantically similar areas
      const parentPolicy = findPolicyForLegislativeArea(tag)
      if (parentPolicy) {
        // Get areas from the same policy
        const policyAreas = policyMap[parentPolicy].filter((area) => area !== tag && !excludeTags.includes(area))

        // Sort by similarity
        similarTags = policyAreas
          .map((area) => ({ area, score: calculateSimilarity(tag, area) }))
          .sort((a, b) => b.score - a.score)
          .slice(0, count)
          .map((item) => item.area)
      }
    }

    // If we couldn't find enough suggestions, add some from other policies
    if (similarTags.length < count) {
      // Get all legislative areas that aren't already selected or suggested
      const remainingAreas = ALL_SUBJECT_TERMS.filter(
        (area) => !excludeTags.includes(area) && !similarTags.includes(area),
      )

      // Sort by similarity to the tag
      const additionalSuggestions = remainingAreas
        .map((area) => ({ area, score: calculateSimilarity(tag, area) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, count - similarTags.length)
        .map((item) => item.area)

      similarTags = [...similarTags, ...additionalSuggestions]
    }

    return similarTags
  }

  // Initialize all tags
  useEffect(() => {
  const initialTags: TagWithSuggestions[] = POLICY_AREAS.map((tag) => ({
    id: `base-${tag}`,
    tag,
    isSuggested: false,
    isSelected: false,
  }))

  setAllTags(initialTags)
}, [])

  // Update tags when keywords or most recent keyword changes
  useEffect(() => {
    if (allTags.length === 0) return

    // Get all base tags and selected suggestions
    const baseTags = allTags.filter((tag) => !tag.isSuggested || selectedSuggestions.has(tag.tag))

    // Update selection state
    const updatedBaseTags = baseTags.map((tag) => ({
      ...tag,
      isSelected: keywords.includes(tag.tag),
    }))

    // Create a new array for all tags including suggestions
    const newAllTags: TagWithSuggestions[] = []
    const processedTags = new Set<string>()

    // Add all base tags and selected suggestions to the processed set
    updatedBaseTags.forEach((tag) => {
      processedTags.add(tag.tag)
      newAllTags.push(tag)
    })

    // Prioritize the most recent keyword for suggestions
    const keywordsToProcess = [...keywords]
    if (mostRecentKeyword && keywords.includes(mostRecentKeyword)) {
      // Move the most recent keyword to the end so it's processed last
      keywordsToProcess.splice(keywordsToProcess.indexOf(mostRecentKeyword), 1)
      keywordsToProcess.push(mostRecentKeyword)
    }

    // For each selected tag, add its suggestions
    keywordsToProcess.forEach((keyword) => {
      // Find the tag in our list
      const tagIndex = newAllTags.findIndex((t) => t.tag === keyword)
      if (tagIndex !== -1) {
        // Get suggestions for this tag
        const excludeTags = [...keywords, ...Array.from(processedTags)]
        const similarTags = getSimilarTags(keyword, 3, excludeTags)

        // Insert suggestions right after the selected tag
        let insertPosition = tagIndex + 1
        similarTags.forEach((tag) => {
          if (!processedTags.has(tag)) {
            // Create a new tag object for this suggestion
            const newTag: TagWithSuggestions = {
              id: `suggestion-${keyword}-${tag}`,
              tag,
              isSuggested: true,
              suggestedBy: keyword,
              isSelected: keywords.includes(tag),
            }

            // Insert at the correct position
            newAllTags.splice(insertPosition, 0, newTag)
            insertPosition++

            // Mark as processed
            processedTags.add(tag)
          }
        })
      }
    })

    setAllTags(newAllTags)
  }, [keywords, mostRecentKeyword, selectedSuggestions])

  const handleTextChange = (text: string) => {
    setInputValue(text)

    if (text.trim()) {
      setIsSearching(true)

      // Perform fuzzy search
      const results = fuse.search(text)

      // Extract and sort results
      const filteredResults = results
        .filter((result) => result.score && result.score < 0.4) // Only include good matches
        .map((result) => result.item)
        .slice(0, 8) // Limit to 8 results

      // Ensure uniqueness in search results
      const uniqueResults = Array.from(new Set(filteredResults))

      // Don't filter out already selected items in search results
      // This allows users to see and select items they've already chosen
      setSearchResults(uniqueResults)
    } else {
      setIsSearching(false)
      setSearchResults([])
    }
  }

  const addInterest = (interest: string) => {
    if (interest.trim() && !keywords.includes(interest)) {
      // Add the interest
      const newKeywords = [...keywords, interest]
      setKeywords(newKeywords)
      setMostRecentKeyword(interest) // Track the most recently added keyword

      // If this is a suggested interest, add it to selectedSuggestions
      const isSuggested = allTags.some((tag) => tag.tag === interest && tag.isSuggested)
      if (isSuggested) {
        setSelectedSuggestions((prev) => {
          const newSet = new Set(prev)
          newSet.add(interest)
          return newSet
        })
      }

      // Clear search after adding
      setInputValue("")
      setSearchResults([])
      setIsSearching(false)

      // Set active tab to "suggested" to show the suggestions
      setActiveTab("suggested")

      // If this is a legislative area, we DON'T automatically add its parent policy
      // This ensures legislative areas selected from search appear as their own cards
      // with their own suggestions
    }
  }

  const removeInterest = (interest: string) => {
    setKeywords(keywords.filter((i) => i !== interest))

    // If we're removing a selected suggestion, remove it from selectedSuggestions
    if (selectedSuggestions.has(interest)) {
      setSelectedSuggestions((prev) => {
        const newSet = new Set(prev)
        newSet.delete(interest)
        return newSet
      })
    }

    // If we're removing the most recent keyword, clear it
    if (mostRecentKeyword === interest) {
      setMostRecentKeyword(keywords.length > 1 ? keywords[keywords.length - 2] : null)
    }
  }

  const toggleInterest = (interest: string) => {
    if (keywords.includes(interest)) {
      removeInterest(interest)
    } else {
      addInterest(interest)
    }
  }

const handleSubmit = async (): Promise<void> => {
  const userId = 30
  const { data, error } = await supabase
    .from('users')
    .update({ keywords })   // pass the array directly
    .eq('id', userId)       // ← matches int4 PK
    .select()

console.log('update returned:', { data, error })

  if (error) {
    console.error(error)
    Alert.alert("Error saving interests", error.message)
  } else {
    router.push("/day")
  }
}


  // Create a list of tags for the "My tags" tab
  const myTags = useMemo(() => {
    // Create a map of all tags for quick lookup
    const tagMap = new Map<string, TagWithSuggestions>()
    allTags.forEach((tag) => {
      tagMap.set(tag.tag, tag)
    })

    // Create tags for all selected keywords
    return keywords.map((keyword) => {
      const existingTag = tagMap.get(keyword)
      if (existingTag) {
        return {
          ...existingTag,
          isSelected: true,
        }
      } else {
        // Create a new tag if it doesn't exist in allTags
        return {
          id: `mytag-${keyword}`,
          tag: keyword,
          isSuggested: false,
          isSelected: true,
        }
      }
    })
  }, [keywords, allTags])

  // Filter tags based on search and active tab
  const filteredTags = useMemo(() => {
    // If we're actively searching, don't show the tag grid
    if (isSearching) {
      return []
    }

    // Determine which tag list to use based on the active tab
    const tagsToFilter = activeTab === "suggested" ? allTags : myTags

    if (!inputValue.trim()) {
      return tagsToFilter
    }

    const query = inputValue.toLowerCase()
    const processedTags = new Set<string>() // Track tags we've already included
    const results: TagWithSuggestions[] = []

    // Filter tags and ensure no duplicates
    tagsToFilter.forEach((item) => {
      if (item.tag.toLowerCase().includes(query) && !processedTags.has(item.tag)) {
        results.push(item)
        processedTags.add(item.tag)
      }
    })
    return results
  }, [inputValue, activeTab, allTags, myTags, isSearching])

  // Clear search and return to normal view
  const clearSearch = () => {
    setInputValue("")
    setSearchResults([])
    setIsSearching(false)
  }

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAF8EC" />
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.brainIcon}>
              <Image source={require("../../assets/auxiom-logo.png")} style={styles.logoImage} resizeMode="contain" />
            </View>
            <Text style={styles.logoText}>Onboarding</Text>
          </View>
        </View>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Political Interests</Text>
            <Text style={styles.subtitle}>Select 5+ topics to stay informed about</Text>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Feather name="search" size={18} color="#777" style={styles.searchIcon} />
              <TextInput
                ref={inputRef}
                value={inputValue}
                onChangeText={handleTextChange}
                placeholder="Search interests"
                style={styles.searchInput}
                placeholderTextColor="#999999"
                theme={{ colors: { text: "#333333" } }}
              />
              {inputValue.length > 0 && (
                <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                  <Feather name="x" size={18} color="#777" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {isSearching && searchResults.length > 0 ? (
            <View style={styles.searchResultsContainer}>
              {searchResults.map((result, index) => (
                <SearchResult
                  key={`${result}-${index}`} // Use both result and index for a unique key
                  result={result}
                  isSelected={keywords.includes(result)}
                  onAdd={() => addInterest(result)}
                  index={index}
                />
              ))}
            </View>
          ) : (
            <>
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tab, activeTab === "suggested" && styles.activeTab]}
                  onPress={() => setActiveTab("suggested")}
                >
                  <Text style={[styles.tabText, activeTab === "suggested" && styles.activeTabText]}>Suggested</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, activeTab === "my-tags" && styles.activeTab]}
                  onPress={() => setActiveTab("my-tags")}
                >
                  <Text style={[styles.tabText, activeTab === "my-tags" && styles.activeTabText]}>My interests</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.tagsContainer}>
                {filteredTags.length > 0 ? (
                  filteredTags.map((item) => (
                    <Tag
                      key={item.id}
                      tag={item.tag}
                      isSelected={item.isSelected}
                      onToggle={() => toggleInterest(item.tag)}
                      isSuggested={item.isSuggested}
                    />
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>
                      {activeTab === "suggested" ? "No matching interests found" : "No interests selected yet"}
                    </Text>
                    <Text style={styles.emptyStateSubtext}>
                      {activeTab === "suggested"
                        ? "Try a different search term"
                        : "Select interests from the Suggested tab"}
                    </Text>
                  </View>
                )}
              </ScrollView>
            </>
          )}

          <View style={styles.buttonContainer}>
            <Button mode="contained" onPress={handleSubmit} style={styles.submitButton} labelStyle={styles.buttonLabel}>
              Next
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </PaperProvider>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAF8EC", // Auxiom light background
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    marginTop: 0,
    marginBottom: 0,
    fontWeight: '400',
  },
  searchContainer: {
    marginVertical: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "transparent",
    color: "#333333",
    height: 48,
    padding: 0,
    margin: 0,
  },
  clearButton: {
    padding: 8,
  },
  searchResultsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  searchResult: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  searchResultText: {
    fontSize: 16,
    color: "#333333",
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: "#4A6FA5", // Auxiom blue
  },
  tabText: {
    color: "#333333",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  scrollContainer: {
    flex: 1,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingBottom: 16,
  },
  tag: {
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  selectedTag: {
    backgroundColor: "#4A6FA5", // Auxiom blue
  },
  unselectedTag: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  tagContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  tagText: {
    color: "#333333",
    fontSize: 14,
    marginRight: 4,
  },
  selectedTagText: {
    color: "#FFFFFF",
  },
  tagIcon: {
    marginLeft: 4,
  },
  suggestedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E8B64C", // Auxiom gold
    marginRight: 6,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#666666",
  },
  suggestionsContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 4,
    maxHeight: 200,
  },
  suggestionsList: {
    backgroundColor: "#FFFFFF",
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  suggestionText: {
    color: "#333333",
  },
  buttonContainer: {
    alignItems: "flex-end",
    marginTop: 16,
    marginBottom: 16,
  },
  submitButton: {
    borderRadius: 24,
    paddingHorizontal: 16,
    backgroundColor: "#4A6FA5", // Auxiom blue
  },
  buttonLabel: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    marginBottom: 8,
  },
  brainIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    overflow: "hidden",
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
})