import { config } from '@gluestack-ui/config';
import {
    Box,
    Button,
    ButtonText,
    FlatList,
    GluestackUIProvider,
    Heading,
    HStack,
    Icon,
    Input,
    InputField,
    Pressable,
    ScrollView,
    Tag,
    TagCloseButton,
    TagText,
    Text,
    VStack
} from '@gluestack-ui/themed';
import Fuse from 'fuse.js';
import { Plus, X } from 'lucide-react-native';
import React, { useMemo, useRef, useState } from 'react';

// Sample interests data (much smaller than your original list)
const SUGGESTED_INTERESTS = [
  "Climate Change", "Technology", "Economics", "Public Health", "Immigration",
  "Media", "Healthcare", "Education", "Civil Rights", "Human Rights",
  "Political Trends", "Infrastructure", "Food Security", "Housing", "Labor",
  "Indigenous Issues", "Elections", "Justice System", "Science", "Diversity",
  "Digital Privacy", "National Security", "Biodiversity", "Wages", "Child Welfare",
  "Globalization", "Energy", "AI Ethics", "Mental Health", "Foreign Policy"
];

// Function to calculate similarity between two strings (simplified version)
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  // Check for word matches
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);

  let wordMatchCount = 0;
  for (const word1 of words1) {
    if (word1.length < 3) continue;
    for (const word2 of words2) {
      if (word2.length < 3) continue;
      if (word1 === word2 || word1.includes(word2) || word2.includes(word1)) {
        wordMatchCount++;
      }
    }
  }

  return wordMatchCount * 3;
}

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

  const handleKeyPress = ({ nativeEvent }: any) => {
    if (nativeEvent.key === 'Enter' && inputValue.trim()) {
      addInterest(inputValue);
    }
  };

  const handleSubmit = () => {
    // In a real app, you would submit the interests to your backend
    console.log('Submitting interests:', keywords);
    alert(`Submitted interests: ${keywords.join(', ')}`);
  };

  return (
    <GluestackUIProvider config={config}>
      <Box flex={1} bg="$backgroundLight50" safeAreaTop>
        <ScrollView>
          <VStack space="md" p="$4">
            {/* Header Section */}
            <VStack space="sm">
              <Heading size="xl">Tell us about your interests</Heading>
              <Text size="md" color="$textLight500">
                Enter 5-10 topics to stay informed about.
              </Text>
            </VStack>

            {/* Interests Container */}
            <Box 
              bg="$backgroundLight100" 
              borderRadius="$lg" 
              p="$4" 
              borderWidth={1}
              borderColor="$borderLight200"
              shadowColor="$shadowLight500"
              shadowOffset={{ width: 0, height: 1 }}
              shadowOpacity={0.1}
              shadowRadius={2}
            >
              <Heading size="md" mb="$2">I want my podcasts to be about...</Heading>
              
              {/* Selected Interests */}
              <Box flexDirection="row" flexWrap="wrap" gap="$2" mb="$4">
                {keywords.map((interest) => (
                  <Tag 
                    key={interest} 
                    size="md" 
                    borderRadius="$full"
                    bg="$gray800"
                    mb="$1"
                  >
                    <TagText color="$white">{interest}</TagText>
                    <TagCloseButton onPress={() => removeInterest(interest)}>
                      <Icon as={X} size="xs" color="$gray400" />
                    </TagCloseButton>
                  </Tag>
                ))}
              </Box>
              
              {/* Input Field */}
              <Box position="relative">
                <Input
                  size="md"
                  borderRadius="$full"
                  bg="$gray800"
                  borderWidth={0}
                >
                  <InputField
                    ref={inputRef}
                    placeholder={keywords.length === 0 ? "Add interest..." : "Add another interest..."}
                    placeholderTextColor="$gray400"
                    color="$gray100"
                    value={inputValue}
                    onChangeText={handleTextChange}
                    onKeyPress={handleKeyPress}
                    onSubmitEditing={() => addInterest(inputValue)}
                  />
                </Input>
                <Pressable 
                  position="absolute" 
                  right="$3" 
                  top="50%" 
                  marginTop="-10px"
                  onPress={() => addInterest(inputValue)}
                >
                  <Icon as={Plus} size="sm" color="$gray400" />
                </Pressable>
              </Box>
              
              {/* Suggestions Dropdown */}
              {suggestions.length > 0 && (
                <Box 
                  mt="$2" 
                  bg="$white" 
                  borderRadius="$md" 
                  borderWidth={1}
                  borderColor="$borderLight200"
                  maxHeight={200}
                >
                  <FlatList
                    data={suggestions}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <Pressable
                        px="$4"
                        py="$2"
                        onPress={() => addInterest(item)}
                        _hover={{ bg: "$gray100" }}
                      >
                        <Text>{item}</Text>
                      </Pressable>
                    )}
                  />
                </Box>
              )}
            </Box>
            
            {/* Related Interests */}
            <VStack space="sm" mt="$2">
              <Text fontWeight="$medium" size="sm" color="$textLight500">
                {keywords.length > 0 ? "Related interests" : "Suggested interests"}
              </Text>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <HStack space="sm">
                  {dynamicSuggestions.map((interest) => (
                    <Pressable
                      key={interest}
                      onPress={() => addInterest(interest)}
                      flexDirection="row"
                      alignItems="center"
                      borderWidth={1}
                      borderColor="$borderLight300"
                      borderRadius="$full"
                      px="$3"
                      py="$1"
                      bg="$transparent"
                    >
                      <Icon as={Plus} size="xs" mr="$1" />
                      <Text size="sm">{interest}</Text>
                    </Pressable>
                  ))}
                </HStack>
              </ScrollView>
            </VStack>
            
            {/* Submit Button */}
            <Box alignItems="flex-end" mt="$4">
              <Button 
                bg="$gray800" 
                borderRadius="$full"
                px="$6"
                onPress={handleSubmit}
                _hover={{ bg: "$gray700" }}
                _pressed={{ bg: "$gray900" }}
              >
                <ButtonText>Submit</ButtonText>
              </Button>
            </Box>
          </VStack>
        </ScrollView>
      </Box>
    </GluestackUIProvider>
  );
}