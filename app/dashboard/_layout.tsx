import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ArticleCacheProvider } from '@/lib/article-cache-context';
import { PodcastProvider } from '@/lib/podcast-context';
import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import GlobalMinimizedPlayer from '@/components/global-minimized-player';
import GlobalPodcastPlayer from '@/components/global-podcast-player';
import { updatePodcastCompletedStatus } from '@/lib/db/queries';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const markAsCompleted = async (podcastId: number) => {
    try {
      await updatePodcastCompletedStatus(podcastId)
    } catch (error) {
      console.error("Error marking podcast as completed:", error)
    }
  }

  return (
    <ArticleCacheProvider>
      <PodcastProvider>
        <View style={{ flex: 1 }}>
          <Tabs
            screenOptions={{
              tabBarActiveTintColor: '#0f172a',
              headerShown: false,
              tabBarStyle: {
                backgroundColor: '#FAF8EC'
              },
            }}>

            <Tabs.Screen
              name="feed"
              options={{
                title: 'Feed',
                tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />
              }}
            />

            <Tabs.Screen
              name="podcasts"
              options={{
                title: 'Podcasts',
                tabBarIcon: ({ color }) => <IconSymbol size={28} name="headphones" color={color} />
              }}
            />

            <Tabs.Screen
              name="settings/index"
              options={{
                title: 'Settings',
                tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />
              }}
            />

            <Tabs.Screen
              name="article-detail"
              options={{
                href: null
              }}
            />

            <Tabs.Screen
              name="settings/edit-profile"
              options={{
                href: null
              }}
            />
            <Tabs.Screen
              name="settings/edit-interests"
              options={{
                href: null
              }}
            />
          </Tabs>
          
          {/* Global Minimized Player - positioned above tab bar */}
          <GlobalMinimizedPlayer />
          
          {/* Global Podcast Player Modal */}
          <GlobalPodcastPlayer onMarkAsCompleted={markAsCompleted} />
        </View>
      </PodcastProvider>
    </ArticleCacheProvider>
  );
}
