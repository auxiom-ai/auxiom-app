import { Tabs } from 'expo-router';
import React from 'react';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#0f172a',
          headerShown: false,
        }}>

        <Tabs.Screen
          name="feed"
          options={{
            title: 'Feed',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />
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
        <Tabs.Screen
          name="settings/edit-delivery-day"
          options={{
            href: null
          }}
        />
      </Tabs>
  );
}
