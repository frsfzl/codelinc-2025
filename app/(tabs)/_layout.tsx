import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="message.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="learning"
        options={{
          title: 'Learning',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
        }}
      />
      <Tabs.Screen
        name="budgeting-basics"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="activity2"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="activity3"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="activity4"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="activity5"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="activity-failed"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="activity-success"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
