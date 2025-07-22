import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { supabase } from "@/lib/supabase"
import { router } from "expo-router"
import { useEffect, useState } from "react"
import { Feather } from "@expo/vector-icons"
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { Button } from "react-native-paper"
import { getUser } from "@/lib/db/queries"
import { updateUserProfile } from "@/lib/actions"

// Industry options for the dropdown
const INDUSTRY_OPTIONS = [
  "Technology",
  "Healthcare",
  "Finance",
  "Consulting",
  "Life Sciences",
  "Academia",
  "Marketing",
  "Manufacturing",
  "Retail",
  "Entertainment",
  "Free Thinker",
]

export default function EditProfileScreen() {
  const [name, setName] = useState<string>("")
  const [occupation, setOccupation] = useState<string>("")
  const [industry, setIndustry] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [showIndustryModal, setShowIndustryModal] = useState<boolean>(false)

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true)
        const userData = await getUser()
        if (userData) {
          setName(userData.name || "")
          setOccupation(userData.occupation || "")
          setIndustry(userData.industry || "")
        }
      } catch (error) {
        console.error("Error loading user data:", error)
        Alert.alert("Error", "Failed to load your profile information.")
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

  const handleSubmit = async (): Promise<void> => {
    if (!name.trim()) {
      Alert.alert("Please enter your name.")
      return
    }
    if (!occupation.trim()) {
      Alert.alert("Please enter your occupation.")
      return
    }
    if (!industry) {
      Alert.alert("Please select your industry.")
      return
    }

    setLoading(true)
    try {
      await updateUserProfile(name.trim(), occupation, industry)
      Alert.alert("Success", "Your profile has been updated successfully", [
        { text: "OK", onPress: () => router.back() }
      ])
    } catch (err) {
      console.error("Error updating profile:", err)
      Alert.alert("Error", "An unexpected error occurred while updating your profile.")
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = name.trim() && occupation.trim() && industry

  return (
    <ThemedView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f5e6" />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.push('/dashboard/settings')} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Edit Profile</ThemedText>
        </View>
      </View>
      
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Form Container */}
        <View style={styles.formContainer}>
          <ThemedText style={styles.subtitle}>Update your professional information</ThemedText>

          {/* Name Field */}
          <View style={styles.fieldContainer}>
            <ThemedText style={styles.fieldLabel}>Name</ThemedText>
            <TextInput
              style={styles.textInput}
              placeholder="Your name"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            <ThemedText style={styles.fieldHelper}>
              This will only be used to address you in our communications.
            </ThemedText>
          </View>

          {/* Occupation Field */}
          <View style={styles.fieldContainer}>
            <ThemedText style={styles.fieldLabel}>Occupation</ThemedText>
            <TextInput
              style={styles.textInput}
              placeholder="Your Position"
              placeholderTextColor="#9CA3AF"
              value={occupation}
              onChangeText={setOccupation}
              autoCapitalize="words"
            />
            <ThemedText style={styles.fieldHelper}>
              This helps us tailor content to your professional needs.
            </ThemedText>
          </View>

          {/* Industry Field */}
          <View style={styles.fieldContainer}>
            <ThemedText style={styles.fieldLabel}>Industry</ThemedText>
            <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowIndustryModal(true)}>
              <ThemedText style={[styles.dropdownText, !industry && styles.placeholderText]}>
                {industry || "Select your industry"}
              </ThemedText>
              <ThemedText style={styles.dropdownArrow}>▼</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.fieldHelper}>
              This helps us tailor content to your professional needs.
            </ThemedText>
          </View>

          {/* Submit Button */}
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
            labelStyle={styles.buttonLabel}
            loading={loading}
            disabled={loading || !isFormValid}
          >
            Save Changes
          </Button>
        </View>
      </ScrollView>
      
      {/* Industry Selection Modal */}
      <Modal
        visible={showIndustryModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowIndustryModal(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowIndustryModal(false)}>
          <View style={styles.modalContent}>
            <ScrollView style={styles.optionsList}>
              {INDUSTRY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.optionItem}
                  onPress={() => {
                    setIndustry(option)
                    setShowIndustryModal(false)
                  }}
                >
                  <ThemedText style={styles.optionText}>{option}</ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
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
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 32,
  },
  formContainer: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  dropdownButton: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: {
    fontSize: 16,
    color: "#1F2937",
  },
  placeholderText: {
    color: "#9CA3AF",
  },
  dropdownArrow: {
    fontSize: 12,
    color: "#6B7280",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    margin: 20,
    maxHeight: 400,
    width: "80%",
  },
  optionsList: {
    maxHeight: 350,
  },
  optionItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  optionText: {
    fontSize: 16,
    color: "#1F2937",
  },
  fieldHelper: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 6,
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: "#1F2937",
    borderRadius: 24,
    paddingVertical: 8,
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  buttonLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
})
