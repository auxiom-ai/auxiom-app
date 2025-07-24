import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ArticleCacheProvider } from '@/lib/article-cache-context';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <ArticleCacheProvider>
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
    </ArticleCacheProvider>
  );
}
