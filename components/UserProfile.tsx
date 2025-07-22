import React from 'react'
import { View, StyleSheet } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { useAuth } from '@/lib/auth-context'

export function UserProfile() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <View style={styles.container}>
        <ThemedText>Loading user...</ThemedText>
      </View>
    )
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <ThemedText>Not authenticated</ThemedText>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ThemedText style={styles.name}>{user.name || 'No name set'}</ThemedText>
      <ThemedText style={styles.email}>{user.email}</ThemedText>
      <ThemedText style={styles.status}>
        Status: {user.active ? 'Active' : 'Inactive'}
      </ThemedText>
      {user.occupation && (
        <ThemedText style={styles.occupation}>
          Occupation: {user.occupation}
        </ThemedText>
      )}
      {user.keywords && user.keywords.length > 0 && (
        <ThemedText style={styles.interests}>
          Interests: {user.keywords.slice(0, 3).join(', ')}
          {user.keywords.length > 3 && ` +${user.keywords.length - 3} more`}
        </ThemedText>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    margin: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  status: {
    fontSize: 14,
    marginBottom: 4,
  },
  occupation: {
    fontSize: 14,
    marginBottom: 4,
  },
  interests: {
    fontSize: 14,
    fontStyle: 'italic',
  },
})
