import { MaterialIcons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { BrandColors } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { useLocale } from '@/lib/i18n';

export default function TabLayout() {
  const { t } = useLocale();
  const { session, isReady } = useAuth();

  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: BrandColors.light.background }}>
        <ActivityIndicator color={BrandColors.light.primary} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: BrandColors.light.navBar,
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: BrandColors.light.navBarTextActive,
        tabBarInactiveTintColor: BrandColors.light.navBarText,
      }}>
      <Tabs.Screen
        name="chat"
        options={{
          title: t('tabs.chat'),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="chat-bubble-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t('tabs.dashboard'),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          title: t('tabs.members'),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: t('tabs.sessions'),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="event" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="trainers"
        options={{
          title: t('tabs.trainers'),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="sports" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
