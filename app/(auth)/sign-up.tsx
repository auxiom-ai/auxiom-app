import { queries } from "@/lib/db/queries"
import { supabase } from "@/lib/supabase"
import { router } from "expo-router"
import { useState } from "react"
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from "react-native"
import { Text } from "react-native-paper"

export default function SignUp() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function signUpWithEmail() {
    setLoading(true)
    try {
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error

      // Get the session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError

      // Create user profile in database
      const { error: dbError } = await queries.createUserProfile({
        id: data.user?.id,
        email: email,
        preferences: {
          keywords: [],
          occupation: "",
          days: [],
          onboarding_completed: false
        }
      })
      if (dbError) throw dbError

      // Get user data to verify
      const { data: userData, error: userError } = await queries.getCurrentUser()
      if (userError) throw userError

      if (userData) {
        router.replace("/day" as any)
      }
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "An error occurred during sign up")
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Create Account</Text>
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
        <TouchableOpacity style={styles.button} onPress={signUpWithEmail} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Creating account..." : "Sign Up"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/sign-in")}>
          <Text style={styles.link}>Already have an account? Sign In</Text>
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