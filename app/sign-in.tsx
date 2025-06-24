import { actions } from "@/lib/db/actions"
import { supabase } from "@/lib/supabase"
import { router } from "expo-router"
import { useState } from "react"
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from "react-native"
import { Text } from "react-native-paper"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function signInWithEmail() {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      // Get user profile to check onboarding status
      const userProfile = await actions.getUserProfile()
      
      if (userProfile.preferences.onboarding_completed) {
        router.replace("/settings" as any)
      } else {
        router.replace("/day")
      }
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "An error occurred during sign in")
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Sign In</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={signInWithEmail} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Signing in..." : "Sign In"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/sign-up")}>
          <Text style={styles.link}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF8EC",
    padding: 20,
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 400,
    width: "100%",
    alignSelf: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#4A6FA5",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  link: {
    color: "#4A6FA5",
    textAlign: "center",
    marginTop: 15,
  },
})