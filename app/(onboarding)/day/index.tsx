"use client"

import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { actions } from "@/lib/db/actions"
import { router } from "expo-router"
import { useState } from "react"
import {
  Alert,
  Animated,
  Easing,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native"
import { Button } from "react-native-paper"

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const DAY_ABBREVIATIONS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export default function DayScreen() {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(6) // Default to Sunday (index 6)
  const [loading, setLoading] = useState<boolean>(false)

  const [fadeAnim] = useState(new Animated.Value(1))
  const [slideAnim] = useState(new Animated.Value(0))
  const [scaleAnim] = useState(new Animated.Value(1))

  const animateTransition = (direction: "left" | "right") => {
    // Start the slide animation
    Animated.sequence([
      // Fade out and slide
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: direction === "left" ? -50 : 50,
          duration: 150,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      // Fade in and slide back
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start()
  }

  const handlePreviousDay = () => {
    animateTransition("left")
    setSelectedDayIndex((prev) => (prev === 0 ? 6 : prev - 1))
  }

  const handleNextDay = () => {
    animateTransition("right")
    setSelectedDayIndex((prev) => (prev === 6 ? 0 : prev + 1))
  }

  const handleSubmit = async (): Promise<void> => {
    try {
      await actions.updateUserDays([DAYS_OF_WEEK[selectedDayIndex]])
      router.replace("/feed" as any)
    } catch (error) {
      console.error(error)
      Alert.alert("Error saving days", error instanceof Error ? error.message : "An unknown error occurred")
    }
  }

  const getPreviousDay = () => {
    const prevIndex = selectedDayIndex === 0 ? 6 : selectedDayIndex - 1
    return DAY_ABBREVIATIONS[prevIndex]
  }

  const getNextDay = () => {
    const nextIndex = selectedDayIndex === 6 ? 0 : selectedDayIndex + 1
    return DAY_ABBREVIATIONS[nextIndex]
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f5e6" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.brainIcon}>
              <Image source={require("../../assets/auxiom-logo.png")} style={styles.logoImage} resizeMode="contain" />
            </View>
            <ThemedText style={styles.logoText}>Onboarding</ThemedText>
          </View>
        </View>
          {/* Main Content */}
          <View style={styles.mainContent}>
            <ThemedText style={styles.title}>When would you like your podcast delivered?</ThemedText>
            <ThemedText style={styles.subtitle}>
              Our free plan offers one short podcast per week. Upgrade your plan to get a longer podcast and access to
              more features.
            </ThemedText>
            {/* Day Selector Carousel */}
            <View style={styles.carouselContainer}>
              {/* Previous Day Button */}
              <TouchableOpacity style={styles.sideCard} onPress={handlePreviousDay}>
                <View style={styles.arrowContainer}>
                  <ThemedText style={styles.arrow}>←</ThemedText>
                </View>
                <ThemedText style={styles.sideCardText}>{getPreviousDay()}</ThemedText>
              </TouchableOpacity>
              {/* Selected Day Card */}
              <Animated.View
                style={[
                  styles.selectedCard,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateX: slideAnim }, { scale: scaleAnim }],
                  },
                ]}
              >
                <ThemedText style={styles.selectedDayText}>{DAYS_OF_WEEK[selectedDayIndex]}</ThemedText>
              </Animated.View>
              {/* Next Day Button */}
              <TouchableOpacity style={styles.sideCard} onPress={handleNextDay}>
                <ThemedText style={styles.sideCardText}>{getNextDay()}</ThemedText>
                <View style={styles.arrowContainer}>
                  <ThemedText style={styles.arrow}>→</ThemedText>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          {/* Submit Button */}
          <View style={styles.submitContainer}>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
              labelStyle={styles.buttonLabel}
              loading={loading}
              disabled={loading}
            >
              Submit
            </Button>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f5e6",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 20, // Lower top padding for ScrollView content
    paddingBottom: 8, // Keep bottom padding small
  },
  header: {
    marginBottom: 20, // Reduced bottom margin for tighter spacing
    marginTop: 20, // Add top margin to push header down
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0, // Add a bit of space below logo+title
  },
  brainIcon: {
    width: 40, // Increased size
    height: 40, // Increased size
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16, // Slightly more space
  },
  logoImage: {
    width: 36, // Increased size
    height: 36, // Increased size
  },
  logoText: {
    fontSize: 30, // Increased size
    fontWeight: "700",
    color: "#1F2937",
    paddingTop: 10,
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  formContent: {
    backgroundColor: "#E5E7EB",
    borderRadius: 19,
    padding: 32,
    paddingTop: 10,
    width: "100%",
    maxWidth: 400,
  },
  title: {
    fontSize: 45,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 24,
    lineHeight: 56,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 80,
    lineHeight: 24,
  },
  carouselContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 60,
  },
  sideCard: {
    backgroundColor: "#D1D5DB",
    borderRadius: 16,
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
    flexDirection: "column",
  },
  selectedCard: {
    backgroundColor: "#9CA3AF",
    borderRadius: 20,
    width: 160,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  arrowContainer: {
    marginBottom: 8,
  },
  arrow: {
    fontSize: 20,
    color: "#6B7280",
    fontWeight: "bold",
  },
  sideCardText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  selectedDayText: {
    fontSize: 24,
    color: "#1F2937",
    fontWeight: "bold",
  },
  submitContainer: {
    alignItems: "flex-end",
    paddingVertical: 24,
  },
  submitButton: {
    backgroundColor: "#1F2937",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 4,
  },
  buttonLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 8,
  },
  selectedCardAnimated: {
    backgroundColor: "#9CA3AF",
    borderRadius: 20,
    width: 160,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 8,
  },
})
