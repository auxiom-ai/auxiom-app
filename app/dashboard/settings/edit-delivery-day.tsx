import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { router } from "expo-router"
import { useEffect, useState } from "react"
import { Feather } from "@expo/vector-icons"
import {
  Alert,
  Animated,
  Easing,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native"
import { Button } from "react-native-paper"
import { getUser } from "@/lib/db/queries"
import { updateUserDeliveryPreference } from "@/lib/actions"

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const DAY_ABBREVIATIONS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export default function EditDeliveryDayScreen() {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(6) // Default to Sunday (index 6)
  const [loading, setLoading] = useState<boolean>(false)
  const [fadeAnim] = useState(new Animated.Value(1))
  const [slideAnim] = useState(new Animated.Value(0))
  const [scaleAnim] = useState(new Animated.Value(1))

  // Load user's delivery day preference
  useEffect(() => {
    const loadUserPreference = async () => {
      try {
        setLoading(true)
        const userData = await getUser()
        if (userData && userData.delivery_day !== undefined && userData.delivery_day !== null) {
          setSelectedDayIndex(userData.delivery_day)
        }
      } catch (error) {
        console.error("Error loading user delivery preference:", error)
        Alert.alert("Error", "Failed to load your delivery day preference.")
      } finally {
        setLoading(false)
      }
    }

    loadUserPreference()
  }, [])

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
    setLoading(true)
    try {
      await updateUserDeliveryPreference(selectedDayIndex)
      Alert.alert("Success", "Your delivery day preference has been updated", [
        { text: "OK", onPress: () => router.back() }
      ])
    } catch (error) {
      console.error("Error updating delivery day:", error)
      Alert.alert("Error", "Failed to update your delivery day preference.")
    } finally {
      setLoading(false)
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
    <ThemedView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f5e6" />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.push('/dashboard/settings')} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Edit Delivery Day</ThemedText>
        </View>
      </View>
      
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
            Save Changes
          </Button>
        </View>
      </ScrollView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f5e6",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    backgroundColor: "#FAF7E6",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E3E0D3",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#222",
  },
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 24,
    lineHeight: 32,
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
    alignItems: "center",
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: "#1F2937",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 4,
    width: "100%",
  },
  buttonLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 8,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 8,
  },
})
