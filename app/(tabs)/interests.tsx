import Fuse from 'fuse.js';
import React, { useMemo, useRef, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Chip, DefaultTheme, Provider as PaperProvider, Surface, Text, TextInput } from 'react-native-paper';

// Sample interests data
const SUGGESTED_INTERESTS = [
  "Climate Change", "Technology", "Economics", "Public Health", "Immigration",
  "Media", "Healthcare", "Education", "Civil Rights", "Human Rights",
  "Political Trends", "Infrastructure", "Food Security", "Housing", "Labor",
  "Indigenous Issues", "Elections", "Justice System", "Science", "Diversity",
  "Digital Privacy", "National Security", "Biodiversity", "Wages", "Child Welfare",
  "Globalization", "Energy", "AI Ethics", "Mental Health", "Foreign Policy"
];

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
  const [keywords, setKeywords] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<any>(null);

  // Initialize Fuse.js for fuzzy search
  const fuse = useMemo(() => new Fuse(SUGGESTED_INTERESTS, { 
    threshold: 0.4, 
    distance: 100 
  }), []);

  // Get dynamic suggestions based on current interests
  const dynamicSuggestions = useMemo(() => {
    if (keywords.length === 0) {
      return SUGGESTED_INTERESTS.slice(0, 5);
    }

    // Simple implementation for related suggestions
    return SUGGESTED_INTERESTS
      .filter(suggestion => !keywords.includes(suggestion))
      .slice(0, 5);
  }, [keywords]);

  const handleTextChange = (text: string) => {
    setInputValue(text);
    if (text.trim()) {
      const filtered = fuse.search(text)
        .map(result => result.item)
        .filter(interest => !keywords.includes(interest));
      setSuggestions(filtered);
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
    alert(`Submitted interests: ${keywords.join(', ')}`);
  };

  return (
    <PaperProvider theme={theme}>
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
            <TextInput
              ref={inputRef}
              value={inputValue}
              onChangeText={handleTextChange}
              placeholder={keywords.length === 0 ? "Add interest..." : "Add another interest..."}
              style={styles.input}
              mode="outlined"
              outlineColor="#333"
              activeOutlineColor="#555"
              right={
                <TextInput.Icon 
                  icon="plus" 
                  onPress={() => addInterest(inputValue)}
                  color="#555"
                />
              }
              onSubmitEditing={() => addInterest(inputValue)}
            />
            
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
          
          {/* Related Interests */}
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
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  surface: {
    padding: 16,
    borderRadius: 8,
    elevation: 4,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
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
    marginTop: 16,
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