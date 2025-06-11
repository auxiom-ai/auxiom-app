"use client"

import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { supabase } from "@/lib/supabase"
import { router } from "expo-router"
import { useState } from "react"
import {
  Alert,
  Image,
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

export default function IdentityScreen() {
  const [name, setName] = useState<string>("")
  const [occupation, setOccupation] = useState<string>("")
  const [industry, setIndustry] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [showIndustryModal, setShowIndustryModal] = useState<boolean>(false)

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
      // Get the current signed-in user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        Alert.alert("Error", "No authenticated user found");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("users")
        .update({
          name: name.trim(),
          occupation: occupation,
          industry: industry,
        })
        .eq("email", user.email)
        .select()

      if (error) {
        console.error("Error updating user info:", error)
        Alert.alert("Error saving information", error.message)
      } else {
        console.log("Updated user info:", data)
        // Navigate to the next onboarding screen
        router.push("/interests")
      }
    } catch (err) {
      console.error("Unexpected error in handleSubmit:", err)
      Alert.alert("Error", "An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = name.trim() && occupation.trim() && industry

  return (
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

        {/* Form Container */}
        <View style={styles.formContainer}>
          <View style={styles.formContent}>
            <ThemedText style={styles.title}>Tell us about yourself</ThemedText>
            <ThemedText style={styles.subtitle}>We'd like to know a bit more about you.</ThemedText>

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
              Next
            </Button>
          </View>
        </View>
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
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60, // Lower top padding for ScrollView content
    paddingBottom: 8, // Keep bottom padding small
  },
  header: {
    marginBottom: 20, // Reduced bottom margin for tighter spacing
    marginTop: 40, // Add top margin to push header down
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
    fontSize: 26, 
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
    marginTop: 24, 
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 32,
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
  pickerContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    overflow: "hidden",
  },
  picker: {
    height: 48,
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
    paddingVertical: 4,
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  buttonLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 8,
  },
})