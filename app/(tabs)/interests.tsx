import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Fuse from 'fuse.js';
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Chip, DefaultTheme, Provider as PaperProvider, Surface, Text, TextInput } from 'react-native-paper';

// Sample interests data
const SUGGESTED_INTERESTS = [
  "Climate Change", "Technology", "Economics", "Public Health", "Immigration",
  "Media", "Healthcare", "Education", "Civil Rights", "Human Rights",
  "Political Trends", "Infrastructure", "Food Security", "Housing", "Labor",
  "Indigenous Issues", "Elections", "Justice System", "Science", "Diversity",
  "Digital Privacy", "National Security", "Biodiversity", "Wages", "Child Welfare",
  "Globalization", "Energy", "AI Ethics", "Mental Health", "Foreign Policy",
  "Voting", "International Relations", "Immigration", "Inequality", "Finance",
  "Space", "Arms Control", "Equality", "Global Trade", "Misinformation",
  "Urban Planning", "Corporate Influence", "Water Resources", "Economic Agreements",
  "Gun Laws", "Transportation", "Taxation", "Law Enforcement", "Drugs",
  "Religious Rights", "Conservation", "Corporate Law", "Election Security",
  "Transparency", "Media Regulation", "Rural Development", "Child Welfare",
  "Healthcare Access", "Education Standards", "Civic Engagement", "Automation",
  "Campaign Finance", "Veterans", "Corporate Taxes", "Statehood", "Free Speech"
];

// Function to calculate similarity between two strings - from original code
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  // Check for exact word matches
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);

  let wordMatchCount = 0;
  for (const word1 of words1) {
    if (word1.length < 3) continue; // Skip short words
    for (const word2 of words2) {
      if (word2.length < 3) continue; // Skip short words
      if (word1 === word2 || word1.includes(word2) || word2.includes(word1)) {
        wordMatchCount++;
      }
    }
  }

  // Check for character-level similarity
  let charMatchCount = 0;
  for (let i = 0; i < s1.length - 2; i++) {
    const trigram = s1.substring(i, i + 3);
    if (s2.includes(trigram)) {
      charMatchCount++;
    }
  }

  return wordMatchCount * 3 + charMatchCount;
}

// Custom theme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#333333',
    accent: '#f1c40f',
  },
};

export default function InterestsScreen() {
// ------ hide this page’s tab button ---
const navigation = useNavigation();
useLayoutEffect(() => {
navigation.setOptions({
// returning null tells React Navigation not to render the icon/label
    tabBarButton: () => null,
});
}, [navigation]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<any>(null);

  // Initialize Fuse.js for fuzzy search
  const fuse = useMemo(() => new Fuse(SUGGESTED_INTERESTS, { 
    threshold: 0.4, 
    distance: 100 
  }), []);

  // Get dynamic suggestions based on current interests - using original algorithm
  const dynamicSuggestions = useMemo(() => {
    if (keywords.length === 0) {
      // If no interests selected yet, return original suggestions
      return SUGGESTED_INTERESTS.slice(0, 5);
    }

    // Calculate similarity scores for each suggestion based on current interests
    const scoredSuggestions = SUGGESTED_INTERESTS
      .filter((suggestion) => !keywords.includes(suggestion))
      .map((suggestion) => {
        let totalScore = 0;
        for (const keyword of keywords) {
          totalScore += calculateSimilarity(keyword, suggestion);
        }
        return { suggestion, score: totalScore };
      });

    // Sort by score (highest first) and return the top 5 suggestions
    return scoredSuggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((item) => item.suggestion);
  }, [keywords]);

  const handleTextChange = (text: string) => {
    setInputValue(text);
    if (text.trim()) {
      const filtered = fuse.search(text)
        .map(result => result.item)
        .filter(interest => !keywords.includes(interest));
      setSuggestions(filtered.slice(0, 5)); // Limit to 5 suggestions
    } else {
      setSuggestions([]);
    }
  };

  const addInterest = (interest: string) => {
    if (interest.trim() && !keywords.includes(interest)) {
      setKeywords([...keywords, interest]);
      setInputValue('');
      setSuggestions([]);

      // Focus back on input after adding
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const removeInterest = (interest: string) => {
    setKeywords(keywords.filter((i) => i !== interest));
  };

  const handleSubmit = () => {
    console.log('Submitting interests:', keywords);
    Alert.alert(
      "Interests Updated", // Custom title
      `Submitted interests: ${keywords.join(', ')}` // Message
    );
  };

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <ScrollView style={styles.container}>
          <View style={styles.content}>
            {/* Header Section */}
            <View style={styles.header}>
              <Text style={styles.title}>Tell us about your interests</Text>
              <Text style={styles.subtitle}>
                Enter 5-10 topics to stay informed about.
              </Text>
            </View>

            {/* Interests Container */}
            <Surface style={styles.surface}>
              <Text style={styles.sectionTitle}>I want my podcasts to be about...</Text>
              
              {/* Selected Interests */}
              <View style={styles.chipContainer}>
                {keywords.map((interest) => (
                  <Chip 
                    key={interest}
                    onClose={() => removeInterest(interest)}
                    style={styles.chip}
                    textStyle={styles.chipText}
                  >
                    {interest}
                  </Chip>
                ))}
              </View>
              
              {/* Input Field */}
              <View style={styles.inputContainer}>
                <TextInput
                  ref={inputRef}
                  value={inputValue}
                  onChangeText={handleTextChange}
                  placeholder={keywords.length === 0 ? "Add interest..." : "Add another interest..."}
                  style={styles.input}
                  mode="outlined"
                  outlineColor="#ddd"
                  activeOutlineColor="#555"
                  right={
                    <TextInput.Icon 
                      icon="plus" 
                      onPress={() => addInterest(inputValue)}
                      color="#555"
                    />
                  }
                //   onSubmitEditing={() => addInterest(inputValue)}
                />
              </View>
              
              {/* Suggestions Dropdown */}
              {suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <FlatList
                    data={suggestions}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.suggestionItem}
                        onPress={() => addInterest(item)}
                      >
                        <Text>{item}</Text>
                      </TouchableOpacity>
                    )}
                    style={styles.suggestionsList}
                  />
                </View>
              )}
            </Surface>
            
            {/* Related Interests - Now using the original algorithm */}
            <View style={styles.relatedSection}>
              <Text style={styles.relatedTitle}>
                {keywords.length > 0 ? "Related interests" : "Suggested interests"}
              </Text>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.relatedChipsContainer}>
                  {dynamicSuggestions.map((interest) => (
                    <Chip
                      key={interest}
                      onPress={() => addInterest(interest)}
                      style={styles.relatedChip}
                      icon="plus"
                      mode="outlined"
                    >
                      {interest}
                    </Chip>
                  ))}
                </View>
              </ScrollView>
            </View>
            
            {/* Submit Button */}
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
        </ScrollView>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF8EC',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#FAF8EC',
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
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  surface: {
    padding: 16,
    borderRadius: 12,
    elevation: 4,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    margin: 4,
    backgroundColor: '#333',
  },
  chipText: {
    color: '#fff',
  },
  inputContainer: {
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
  },
  suggestionsContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 4,
    maxHeight: 200,
  },
  suggestionsList: {
    backgroundColor: '#fff',
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  relatedSection: {
    marginTop: 24,
  },
  relatedTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  relatedChipsContainer: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  relatedChip: {
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    alignItems: 'flex-end',
    marginTop: 24,
    marginBottom: 16,
  },
  submitButton: {
    borderRadius: 24,
    paddingHorizontal: 16,
    backgroundColor: '#333',
  },
  buttonLabel: {
    color: '#fff',
    fontWeight: '600',
  },
});