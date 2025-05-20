"use client"

import { useNavigation } from "@react-navigation/native"
import Fuse from "fuse.js"
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Alert, FlatList, Platform, SafeAreaView, StatusBar, StyleSheet, TouchableOpacity, View } from "react-native"
import { Button, Chip, DefaultTheme, Provider as PaperProvider, Surface, Text, TextInput } from "react-native-paper"

// Import the policy map
const policyMap: Record<string, string[]> = require("./policy-subject-map-116-119.json")

// Get all policy areas (top-level categories)
const POLICY_AREAS = Object.keys(policyMap)

// Flatten every subject term into one master array (deduped + sorted)
const ALL_SUBJECT_TERMS: string[] = Array.from(new Set(Object.values(policyMap).flat() as string[])).sort()

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

// ---- custom theme (updated to match auxiom) ---------------------------
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#333333",
    accent: "#f1c40f",
    background: "#FAF8EC",
  },
}

// Custom PolicyTag component
type PolicyTagProps = {
  tag: string
  isSelected: boolean
  onToggle: () => void
  isSubTag?: boolean
  isSimilar?: boolean
}

const PolicyTag = ({ tag, isSelected, onToggle, isSubTag = false, isSimilar = false }: PolicyTagProps) => {
  return (
    <Chip
      mode={isSubTag ? "outlined" : "flat"}
      selected={isSelected}
      onPress={onToggle}
      style={[
        styles.policyChip,
        isSelected && (isSubTag ? styles.selectedSubTagChip : styles.selectedChip),
        isSubTag && styles.subTagChip,
        isSimilar && !isSelected && styles.similarChip,
      ]}
      closeIcon={isSelected ? "close" : "plus"}
      onClose={onToggle}
    >
      <View style={styles.chipContent}>
        {/* Only show purple dot on similar items that are NOT selected */}
        {isSimilar && !isSelected && isSubTag && <View style={styles.similarIndicator} />}
        <Text
          style={[styles.chipText, isSelected && (isSubTag ? styles.selectedSubTagText : styles.selectedChipText)]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {tag}
        </Text>
      </View>
    </Chip>
  )
}

export default function InterestsScreen() {
  // hide this tab
  const navigation = useNavigation()
  useLayoutEffect(() => {
    navigation.setOptions({ tabBarButton: () => null })
  }, [navigation])

  const [keywords, setKeywords] = useState<string[]>([])
  const [inputValue, setInputValue] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("suggested")
  const [displayedAreas, setDisplayedAreas] = useState<Record<string, string[]>>({})
  const [lastSelectedArea, setLastSelectedArea] = useState<string | null>(null)
  const [recentlyAddedAreas, setRecentlyAddedAreas] = useState<Record<string, string[]>>({})
  const [lastAddedTimestamp, setLastAddedTimestamp] = useState<number>(0)
  const [allSuggestedAreas, setAllSuggestedAreas] = useState<string[]>([])
  const [selectedAreaPolicies, setSelectedAreaPolicies] = useState<Record<string, string>>({})
  const [forceRefresh, setForceRefresh] = useState(0) // Used to force re-render when needed
  const inputRef = useRef<any>(null)

  // ---- fuzzy search over ALL_SUBJECT_TERMS -----------------------------
  const fuse = useMemo(() => new Fuse([...POLICY_AREAS, ...ALL_SUBJECT_TERMS], { threshold: 0.4, distance: 100 }), [])

  // ---- related suggestions ---------------------------------------------
  const dynamicSuggestions = useMemo(() => {
    const source = POLICY_AREAS
    if (keywords.length === 0) return source.slice(0, 5)
    const scored = source
      .filter((s) => !keywords.includes(s))
      .map((s) => ({ suggestion: s, score: keywords.reduce((acc, kw) => acc + calculateSimilarity(kw, s), 0) }))
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((x) => x.suggestion)
  }, [keywords])

  // Find which policy area a legislative area belongs to
  const findPolicyForLegislativeArea = (area: string): string | null => {
    // If this area was selected under a specific policy, return that policy
    if (selectedAreaPolicies[area]) {
      return selectedAreaPolicies[area]
    }

    // Otherwise, find the first policy that contains this area
    for (const [policy, areas] of Object.entries(policyMap)) {
      if (areas.includes(area)) {
        return policy
      }
    }
    return null
  }

  // Get all policy areas that contain a legislative area
  const getAllPoliciesForLegislativeArea = (area: string): string[] => {
    return POLICY_AREAS.filter((policy) => policyMap[policy]?.includes(area))
  }

  // Get semantically diverse legislative areas for a policy
  const getDiverseLegislativeAreas = (policy: string, count = 5): string[] => {
    if (!policyMap[policy]) return []

    // Get all areas from this policy that aren't already selected
    const availableAreas = policyMap[policy].filter((area) => !keywords.includes(area))

    if (availableAreas.length <= count) {
      return availableAreas
    }

    // To get diverse areas, we'll select areas that are semantically different from each other
    const selectedAreas: string[] = []

    // Start with a random area
    const randomIndex = Math.floor(Math.random() * availableAreas.length)
    selectedAreas.push(availableAreas[randomIndex])

    // For each additional area, select the one that's most different from all currently selected areas
    while (selectedAreas.length < count) {
      let bestArea = ""
      let lowestSimilarityScore = Number.POSITIVE_INFINITY

      for (const area of availableAreas) {
        if (selectedAreas.includes(area)) continue

        // Calculate how similar this area is to all already selected areas
        const totalSimilarity = selectedAreas.reduce(
          (sum, selectedArea) => sum + calculateSimilarity(selectedArea, area),
          0,
        )

        // We want the area with the lowest similarity (most different)
        if (totalSimilarity < lowestSimilarityScore) {
          lowestSimilarityScore = totalSimilarity
          bestArea = area
        }
      }

      if (bestArea) {
        selectedAreas.push(bestArea)
      } else {
        break // No more areas to add
      }
    }

    return selectedAreas
  }

  // Get the most semantically similar legislative areas for a selected area
  const getSimilarLegislativeAreas = (selectedArea: string, count = 3): string[] => {
    const parentPolicy = findPolicyForLegislativeArea(selectedArea)
    if (!parentPolicy) return []

    // Get all areas from this policy except the selected one and already selected areas
    const availableAreas = policyMap[parentPolicy].filter(
      (area) => area !== selectedArea && !keywords.includes(area) && !allSuggestedAreas.includes(area),
    )

    if (availableAreas.length === 0) {
      // If no available areas after filtering, try with just excluding the selected area
      const fallbackAreas = policyMap[parentPolicy].filter((area) => area !== selectedArea && !keywords.includes(area))

      if (fallbackAreas.length === 0) {
        return []
      }

      // Sort by similarity to the selected area
      return [...fallbackAreas]
        .map((area) => ({
          area,
          score: calculateSimilarity(selectedArea, area),
        }))
        .sort((a, b) => b.score - a.score) // Sort by MOST similar
        .slice(0, Math.min(count, fallbackAreas.length))
        .map((item) => item.area)
    }

    // Sort by similarity to the selected area
    return [...availableAreas]
      .map((area) => ({
        area,
        score: calculateSimilarity(selectedArea, area),
      }))
      .sort((a, b) => b.score - a.score) // Sort by MOST similar
      .slice(0, Math.min(count, availableAreas.length))
      .map((item) => item.area)
  }

  // Get all selected legislative areas for a policy
  const getSelectedLegislativeAreas = (policy: string): string[] => {
    if (!policyMap[policy]) return []

    // Get all areas from this policy that are in keywords
    // and areas that were specifically selected under this policy
    return policyMap[policy].filter(
      (area) => keywords.includes(area) && (!selectedAreaPolicies[area] || selectedAreaPolicies[area] === policy),
    )
  }

  // Check if any legislative areas are selected for a policy
  const hasSelectedLegislativeAreas = (policy: string): boolean => {
    return getSelectedLegislativeAreas(policy).length > 0
  }

  // Initialize or update displayed areas for a policy
  const updateDisplayedAreasForPolicy = (policy: string) => {
    // If we already have displayed areas for this policy, keep them
    if (displayedAreas[policy] && displayedAreas[policy].length > 0) {
      // Get selected areas that might not be in the displayed list yet
      const selectedAreas = getSelectedLegislativeAreas(policy)
      const currentDisplayed = [...displayedAreas[policy]]

      // Add any selected areas that aren't already displayed
      selectedAreas.forEach((area) => {
        if (!currentDisplayed.includes(area)) {
          currentDisplayed.push(area)
        }
      })

      // If we have a newly selected area, add similar areas right after it
      if (lastSelectedArea) {
        const parentPolicy = findPolicyForLegislativeArea(lastSelectedArea)
        if (parentPolicy === policy) {
          // Always get exactly 3 similar areas when possible
          const similarAreas = getSimilarLegislativeAreas(lastSelectedArea, 3)
          const lastSelectedIndex = currentDisplayed.indexOf(lastSelectedArea)

          if (lastSelectedIndex !== -1) {
            // Insert similar areas right after the last selected area
            // but only if they're not already in the list
            let insertCount = 0
            const newAreas: string[] = []

            similarAreas.forEach((similar) => {
              if (!currentDisplayed.includes(similar)) {
                currentDisplayed.splice(lastSelectedIndex + 1 + insertCount, 0, similar)
                newAreas.push(similar)
                insertCount++
              }
            })

            // Only the most recent 3 areas should be purple
            if (newAreas.length > 0) {
              // Update timestamp to mark this as the most recent addition
              setLastAddedTimestamp(Date.now())

              // Replace any previous recently added areas for this policy
              setRecentlyAddedAreas((prev) => ({
                ...prev,
                [policy]: newAreas,
              }))

              // Add to global list of suggested areas
              setAllSuggestedAreas((prev) => [...prev, ...newAreas])
            }
          }
        }
      }

      // Update the displayed areas
      setDisplayedAreas((prev) => ({
        ...prev,
        [policy]: currentDisplayed,
      }))
    } else {
      // If no displayed areas yet, initialize with selected areas + appropriate suggestions
      const selectedAreas = getSelectedLegislativeAreas(policy)

      if (selectedAreas.length > 0) {
        // Start with selected areas
        const areasToShow = [...selectedAreas]
        const newAreas: string[] = []

        // Get the most recently selected area
        const mostRecentArea =
          lastSelectedArea && selectedAreas.includes(lastSelectedArea)
            ? lastSelectedArea
            : selectedAreas[selectedAreas.length - 1]

        // Add exactly 3 similar areas for the most recent area
        const similarAreas = getSimilarLegislativeAreas(mostRecentArea, 3)
        similarAreas.forEach((similar) => {
          if (!areasToShow.includes(similar)) {
            areasToShow.push(similar)
            newAreas.push(similar)
          }
        })

        // Only the most recent 3 areas should be purple
        if (newAreas.length > 0) {
          // Update timestamp to mark this as the most recent addition
          setLastAddedTimestamp(Date.now())

          // Replace any previous recently added areas for this policy
          setRecentlyAddedAreas((prev) => ({
            ...prev,
            [policy]: newAreas,
          }))

          // Add to global list of suggested areas
          setAllSuggestedAreas((prev) => [...prev, ...newAreas])
        }

        setDisplayedAreas((prev) => ({
          ...prev,
          [policy]: areasToShow,
        }))
      } else {
        // If no selected areas, show diverse areas for the policy
        const diverseAreas = getDiverseLegislativeAreas(policy, 5)

        // Update timestamp to mark this as the most recent addition
        setLastAddedTimestamp(Date.now())

        // Replace any previous recently added areas for this policy
        setRecentlyAddedAreas((prev) => ({
          ...prev,
          [policy]: diverseAreas,
        }))

        // Add to global list of suggested areas
        setAllSuggestedAreas((prev) => [...prev, ...diverseAreas])

        setDisplayedAreas((prev) => ({
          ...prev,
          [policy]: diverseAreas,
        }))
      }
    }

    // Reset the last selected area after processing
    setLastSelectedArea(null)
  }

  // Effect to update displayed areas when keywords change
  useEffect(() => {
    // Update displayed areas for all policies that are selected or have selected legislative areas
    POLICY_AREAS.forEach((policy) => {
      if (keywords.includes(policy) || hasSelectedLegislativeAreas(policy)) {
        updateDisplayedAreasForPolicy(policy)
      }
    })
  }, [keywords, lastSelectedArea, allSuggestedAreas, forceRefresh])

  // When a keyword is removed, we need to remove it from allSuggestedAreas
  useEffect(() => {
    // For each policy area, check if any displayed areas are no longer in the keywords
    // and remove them from allSuggestedAreas
    const allDisplayedAreas = Object.values(displayedAreas).flat()

    // Filter out any areas that are no longer displayed
    setAllSuggestedAreas((prev) => prev.filter((area) => allDisplayedAreas.includes(area) && !keywords.includes(area)))
  }, [displayedAreas, keywords])

  const isAreaSimilar = (policy: string, area: string): boolean => {
    // If the area is selected, it's not considered "similar" for styling purposes
    if (keywords.includes(area)) return false

    // Check if this is one of the most recently added areas (should be purple)
    if (recentlyAddedAreas[policy] && recentlyAddedAreas[policy].includes(area)) {
      return true
    }

    return false
  }

  const handleTextChange = (text: string) => {
    setInputValue(text)
    if (text.trim()) {
      const filtered = fuse
        .search(text)
        .map((res) => res.item)
        .filter((i) => !keywords.includes(i))
      setSuggestions(filtered.slice(0, 5))
    } else {
      setSuggestions([])
    }
  }

  const addInterest = (interest: string, fromPolicy?: string) => {
    if (interest.trim() && !keywords.includes(interest)) {
      setKeywords((prev) => [...prev, interest])
      setLastSelectedArea(interest)
      setInputValue("")
      setSuggestions([])

      // If this is a legislative area, make sure its policy is expanded
      const parentPolicy = fromPolicy || findPolicyForLegislativeArea(interest)
      if (parentPolicy) {
        // Remember which policy this area was selected under
        if (policyMap[parentPolicy]?.includes(interest)) {
          setSelectedAreaPolicies((prev) => ({
            ...prev,
            [interest]: parentPolicy,
          }))
        }

        // Add the parent policy too if not already selected
        if (!keywords.includes(parentPolicy)) {
          setKeywords((prev) => [...prev, parentPolicy])
        }
      }

      // Remove this interest from allSuggestedAreas if it was there
      setAllSuggestedAreas((prev) => prev.filter((area) => area !== interest))

      // Force a refresh to ensure new suggestions are generated
      setForceRefresh((prev) => prev + 1)
      // Ensure we always generate 3 new suggestions when a legislative area is selected
      if (policyMap[fromPolicy || ""]?.includes(interest)) {
        // This is a legislative area, not a policy
        setLastSelectedArea(interest)
      }
    }
  }

  const removeInterest = (interest: string) => {
    setKeywords(keywords.filter((i) => i !== interest))

    // Remove from selectedAreaPolicies if it's there
    if (selectedAreaPolicies[interest]) {
      setSelectedAreaPolicies((prev) => {
        const updated = { ...prev }
        delete updated[interest]
        return updated
      })
    }

    // Also remove any recently added areas associated with this interest
    const parentPolicy = findPolicyForLegislativeArea(interest)
    if (parentPolicy && recentlyAddedAreas[parentPolicy]) {
      // Remove this interest's suggestions from recently added areas
      setRecentlyAddedAreas((prev) => {
        const updated = { ...prev }
        if (updated[parentPolicy]) {
          updated[parentPolicy] = updated[parentPolicy].filter((area) => area !== interest)
        }
        return updated
      })
    }

    // Force a refresh to ensure the UI updates correctly
    setForceRefresh((prev) => prev + 1)
  }

  const toggleInterest = (interest: string, policy?: string) => {
    if (keywords.includes(interest)) {
      removeInterest(interest)
    } else {
      addInterest(interest, policy)
    }
  }

  const handleSubmit = () => {
    Alert.alert("Interests Updated", `Submitted interests: ${keywords.join(", ")}`)
  }

  // Filter policies based on search
  const filteredPolicies = useMemo(() => {
    if (!inputValue.trim()) return POLICY_AREAS

    const query = inputValue.toLowerCase()
    const directMatches = POLICY_AREAS.filter((policy) => policy.toLowerCase().includes(query))

    // Also include policies that have matching legislative areas
    const indirectMatches = Object.entries(policyMap)
      .filter(
        ([policy, areas]) =>
          areas.some((area) => area.toLowerCase().includes(query)) && !directMatches.includes(policy),
      )
      .map(([policy]) => policy)

    return [...directMatches, ...indirectMatches]
  }, [inputValue])

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={
            <>
              <StatusBar barStyle="dark-content" backgroundColor="#FAF8EC" />
              <View style={styles.content}>
                <View style={styles.header}>
                  <Text style={styles.title}>Tags</Text>
                </View>

                <View style={styles.searchContainer}>
                  <TextInput
                    ref={inputRef}
                    value={inputValue}
                    onChangeText={handleTextChange}
                    placeholder="Search tags"
                    style={styles.searchInput}
                    mode="outlined"
                    outlineColor="#333"
                    activeOutlineColor="#555"
                    placeholderTextColor="#777"
                    left={<TextInput.Icon icon="magnify" color="#777" />}
                  />
                </View>

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
                    <Text style={[styles.tabText, activeTab === "my-tags" && styles.activeTabText]}>My tags</Text>
                  </TouchableOpacity>
                </View>

                <Surface style={styles.tagsContainer}>
                  {activeTab === "suggested" ? (
                    <View style={styles.policyTagsContainer}>
                      {filteredPolicies.map((policy) => {
                        const isSelected = keywords.includes(policy)
                        const hasSelectedAreas = hasSelectedLegislativeAreas(policy)
                        const shouldShowAreas = isSelected

                        // If this policy should show areas, make sure we have them
                        if (shouldShowAreas && (!displayedAreas[policy] || displayedAreas[policy].length === 0)) {
                          updateDisplayedAreasForPolicy(policy)
                        }

                        const areasToDisplay = shouldShowAreas && displayedAreas[policy] ? displayedAreas[policy] : []

                        return (
                          <View
                            key={policy}
                            style={[
                              styles.policyTagWrapper,
                              hasSelectedAreas && styles.policyTagWrapperWithSelectedArea,
                              isSelected && styles.selectedPolicyWrapper,
                            ]}
                          >
                            <PolicyTag tag={policy} isSelected={isSelected} onToggle={() => toggleInterest(policy)} />

                            {/* Expanded legislative areas - only show when policy is selected */}
                            {shouldShowAreas && areasToDisplay.length > 0 && (
                              <View style={styles.legislativeAreasContainer}>
                                {areasToDisplay.map((area) => (
                                  <PolicyTag
                                    key={`${policy}-${area}`}
                                    tag={area}
                                    isSelected={keywords.includes(area)}
                                    onToggle={() => toggleInterest(area, policy)}
                                    isSubTag
                                    isSimilar={isAreaSimilar(policy, area)}
                                  />
                                ))}
                              </View>
                            )}
                          </View>
                        )
                      })}
                    </View>
                  ) : (
                    <View style={styles.myTagsContainer}>
                      {/* Show only selected policy areas */}
                      {POLICY_AREAS.filter((policy) => keywords.includes(policy)).map((policy) => (
                        <View key={policy} style={styles.selectedTagItem}>
                          <PolicyTag tag={policy} isSelected={true} onToggle={() => toggleInterest(policy)} />
                        </View>
                      ))}

                      {/* Show selected legislative areas */}
                      {ALL_SUBJECT_TERMS.filter((term) => keywords.includes(term)).map((term) => {
                        const parentPolicy = findPolicyForLegislativeArea(term)
                        return (
                          <View key={term} style={styles.selectedTagItem}>
                            <PolicyTag
                              tag={term}
                              isSelected={true}
                              onToggle={() => toggleInterest(term)}
                              isSubTag={true}
                            />
                            {parentPolicy && <Text style={styles.parentPolicyText}>{parentPolicy}</Text>}
                          </View>
                        )
                      })}

                      {keywords.length === 0 && (
                        <View style={styles.emptyStateContainer}>
                          <Text style={styles.emptyStateText}>No tags selected yet</Text>
                          <Text style={styles.emptyStateSubText}>Select tags from the Suggested tab</Text>
                        </View>
                      )}
                    </View>
                  )}
                </Surface>

                {suggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    <FlatList
                      data={suggestions}
                      keyExtractor={(item) => item}
                      renderItem={({ item }) => (
                        <TouchableOpacity style={styles.suggestionItem} onPress={() => addInterest(item)}>
                          <Text style={styles.suggestionText}>{item}</Text>
                        </TouchableOpacity>
                      )}
                      style={styles.suggestionsList}
                    />
                  </View>
                )}

                <View style={styles.buttonContainer}>
                  <Button
                    mode="contained"
                    onPress={handleSubmit}
                    style={styles.submitButton}
                    labelStyle={styles.buttonLabel}
                  >
                    Submit
                  </Button>
                </View>
              </View>
            </>
          }
        />
      </SafeAreaView>
    </PaperProvider>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAF8EC", // Updated to auxiom color
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  content: {
    padding: 16,
    paddingTop: 24,
  },
  header: {
    marginBottom: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333", // Darker text for better contrast on light background
    marginBottom: 8,
  },
  searchContainer: {
    marginVertical: 16,
  },
  searchInput: {
    backgroundColor: "#fff", // Lighter input on light background
    borderRadius: 24,
    height: 48,
    color: "#333",
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd", // Lighter border for light theme
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: "#333", // Dark tab on light background
  },
  tabText: {
    color: "#333", // Dark text on light background
    fontWeight: "500",
  },
  activeTabText: {
    color: "#fff", // White text on dark tab
  },
  tagsContainer: {
    backgroundColor: "transparent",
    elevation: 0,
  },
  policyTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    justifyContent: "flex-start",
  },
  policyTagWrapper: {
    marginBottom: 16,
    padding: 4,
    borderRadius: 8,
    width: "48%", // Set to approximately half the container width to fit 2 per row
    marginHorizontal: "1%",
    borderWidth: 1,
    borderColor: "#eee", // Light border for all policy wrappers
  },
  selectedPolicyWrapper: {
    borderColor: "#333", // Darker border for selected policies
    borderWidth: 1,
  },
  policyTagWrapperWithSelectedArea: {
    backgroundColor: "#f0f0f8", // Light purple background when legislative area is selected
    padding: 8,
    marginBottom: 20,
    width: "98%", // When expanded, take full width
  },
  policyChip: {
    margin: 2,
    backgroundColor: "#fff", // White chips on light background
    borderColor: "#ddd",
  },
  selectedChip: {
    backgroundColor: "#333", // Dark chip for selected policy
  },
  selectedSubTagChip: {
    backgroundColor: "#5D6D7E", // Different color for selected legislative areas
  },
  subTagChip: {
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  similarChip: {
    backgroundColor: "#f8f0ff", // Light purple background for similar items
    borderColor: "#d0b0e0", // Purple border for similar items
  },
  chipContent: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap", // Allow content to wrap
    paddingVertical: 2,
  },
  chipText: {
    color: "#333", // Dark text on light chips
    fontSize: 14,
    flexShrink: 1, // Allow text to shrink
  },
  selectedChipText: {
    color: "#fff", // White text on dark chips
  },
  selectedSubTagText: {
    color: "#333", // Ensure text is white on dark background for selected sub tags
  },
  similarIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#9c27b0", // Purple dot indicator
    marginRight: 6,
  },
  legislativeAreasContainer: {
    marginLeft: 8,
    marginTop: 8,
    marginBottom: 8,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  suggestionsContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#ddd", // Lighter border for light theme
    borderRadius: 4,
    maxHeight: 200,
  },
  suggestionsList: {
    backgroundColor: "#fff", // White background for suggestions
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee", // Very light border for suggestions
  },
  suggestionText: {
    color: "#333", // Dark text for suggestions
  },
  buttonContainer: {
    alignItems: "flex-end",
    marginTop: 24,
    marginBottom: 16,
  },
  submitButton: {
    borderRadius: 24,
    paddingHorizontal: 16,
    backgroundColor: "#333", // Dark button on light background
  },
  buttonLabel: {
    color: "#fff", // White text on dark button
    fontWeight: "600",
  },
  myTagsContainer: {
    flexDirection: "column",
    marginBottom: 16,
  },
  selectedTagItem: {
    marginBottom: 8,
    padding: 4,
  },
  parentPolicyText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 12,
    marginTop: 2,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: "#666",
  },
})
