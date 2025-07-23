import React, { useEffect, useRef } from 'react'
import { ThemedView } from "@/components/ThemedView"
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  Dimensions,
  Animated,
  StyleProp,
  ViewStyle,
} from "react-native"

const { width: screenWidth } = Dimensions.get('window')

// Skeleton shimmer animation component
interface SkeletonShimmerProps {
  width: number;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

const SkeletonShimmer = ({ width, height, borderRadius = 8, style = {} as StyleProp<ViewStyle> }: SkeletonShimmerProps) => {
  const animatedValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const shimmer = () => {
      animatedValue.setValue(0)
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start(() => shimmer())
    }
    shimmer()
  }, [])

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  })

  return (
    <View style={[{ width, height, backgroundColor: '#0f172a10', borderRadius, overflow: 'hidden' }, style]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: '#0f172a20',
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  )
}

// Replace the loading section in your FeedScreen component with this:
export const FeedSkeleton: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAF8EC" />
        
        {/* Header Skeleton */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <SkeletonShimmer width={40} height={40} borderRadius={20} />
            <View style={{ marginLeft: 10 }}>
              <SkeletonShimmer width={150} height={24} borderRadius={4} />
            </View>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Search Bar Skeleton */}
          <View style={styles.searchContainer}>
            <SkeletonShimmer width={screenWidth - 32} height={48} borderRadius={12} />
          </View>

          {/* Topic Filter Skeleton */}
          <View style={styles.topicContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.topicContentContainer}
            >
              {[60, 80, 70, 90, 75].map((width, index) => (
                <View key={index} style={{ marginRight: 8 }}>
                  <SkeletonShimmer width={width} height={40} borderRadius={20} />
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Results Info Skeleton */}
          <View style={styles.resultsInfo}>
            <SkeletonShimmer width={200} height={14} borderRadius={4} />
          </View>

          {/* Article Cards Skeleton */}
          {[1, 2, 3, 4, 5].map((_, index) => (
            <View key={index} style={[styles.articleCard, index === 0 && styles.featuredCard]}>
              <View style={styles.articleHeader}>
                {/* Featured Badge Skeleton (only for first card) */}
                {index === 0 && (
                  <View style={{ marginBottom: 12 }}>
                    <SkeletonShimmer width={80} height={20} borderRadius={12} />
                  </View>
                )}
                
                {/* Title Skeleton */}
                <View style={{ marginBottom: 12 }}>
                  <SkeletonShimmer 
                    width={screenWidth - 80} 
                    height={index === 0 ? 28 : 24} 
                    borderRadius={4} 
                    style={{ marginBottom: 6 }}
                  />
                  <SkeletonShimmer 
                    width={screenWidth - 120} 
                    height={index === 0 ? 28 : 24} 
                    borderRadius={4} 
                  />
                </View>
                
                {/* Summary Skeleton */}
                <View style={{ marginBottom: 12 }}>
                  <SkeletonShimmer 
                    width={screenWidth - 80} 
                    height={16} 
                    borderRadius={4} 
                    style={{ marginBottom: 4 }}
                  />
                  <SkeletonShimmer 
                    width={screenWidth - 100} 
                    height={16} 
                    borderRadius={4} 
                    style={{ marginBottom: 4 }}
                  />
                  <SkeletonShimmer 
                    width={screenWidth - 140} 
                    height={16} 
                    borderRadius={4} 
                  />
                </View>
                
                {/* Topics Tags Skeleton */}
                <View style={[styles.tagsContainer, { marginBottom: 8 }]}>
                  {[60, 80, 70].map((width, tagIndex) => (
                    <View key={tagIndex} style={{ marginRight: 6, marginBottom: 6 }}>
                      <SkeletonShimmer width={width} height={24} borderRadius={12} />
                    </View>
                  ))}
                </View>
                
                {/* Regular Tags Skeleton */}
                <View style={[styles.tagsContainer, { marginBottom: 16 }]}>
                  {[50, 65, 55, 70].map((width, tagIndex) => (
                    <View key={tagIndex} style={{ marginRight: 6, marginBottom: 6 }}>
                      <SkeletonShimmer width={width} height={24} borderRadius={12} />
                    </View>
                  ))}
                </View>
                
                {/* Article Meta Skeleton */}
                <View style={styles.articleMeta}>
                  <View style={styles.authorsContainer}>
                    <SkeletonShimmer width={120} height={16} borderRadius={4} />
                  </View>
                  <View style={styles.metaInfo}>
                    <SkeletonShimmer width={80} height={14} borderRadius={4} />
                  </View>
                </View>
              </View>
            </View>
          ))}

          {/* Pagination Skeleton */}
          <View style={styles.paginationContainer}>
            <SkeletonShimmer width={100} height={16} borderRadius={4} />
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#0f172a20",
    marginTop: 20,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchContainer: {
    paddingVertical: 12,
  },
  topicContainer: {
    paddingBottom: 8,
    maxHeight: 60,
  },
  topicContentContainer: {
    paddingVertical: 8,
  },
  resultsInfo: {
    paddingVertical: 8,
  },
  articleCard: {
    marginVertical: 12,
    backgroundColor: "#0f172a15",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#0f172a",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "#0f172a20",
  },
  featuredCard: {
    borderWidth: 2,
    borderColor: "#0f172a",
    backgroundColor: "#0f172a20",
  },
  articleHeader: {
    padding: 20,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  articleMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#0f172a30",
  },
  authorsContainer: {
    flex: 1,
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  paginationContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
})
