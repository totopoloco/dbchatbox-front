import { useApolloClient } from '@apollo/client';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandColors, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { useLocale } from '@/lib/i18n';

export default function ProfileScreen() {
  const { t } = useLocale();
  const { session, signOut } = useAuth();
  const apolloClient = useApolloClient();
  const router = useRouter();

  const handleSignOut = async () => {
    await apolloClient.clearStore();
    await signOut();
    router.replace('/');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.heading}>{t('tabs.profile')}</ThemedText>

      {session && (
        <ThemedView style={styles.card} lightColor={BrandColors.light.surfaceVariant} darkColor={BrandColors.dark.surfaceVariant}>
          <ThemedText style={styles.role}>{session.role.toUpperCase()}</ThemedText>
          <ThemedText style={styles.username}>{session.username}</ThemedText>
          {session.email && <ThemedText style={styles.email}>{session.email}</ThemedText>}
        </ThemedView>
      )}

      <TouchableOpacity
        style={styles.signOutBtn}
        onPress={handleSignOut}
        activeOpacity={0.85}
        accessibilityRole="button">
        <ThemedText style={styles.signOutText}>{t('profile.signOut')}</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
  },
  card: {
    borderRadius: 12,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    minWidth: 240,
    gap: 4,
  },
  role: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: BrandColors.light.primary,
  },
  username: { fontSize: 16, fontWeight: '700' },
  email: { fontSize: 13, opacity: 0.7 },
  signOutBtn: {
    borderWidth: 1.5,
    borderColor: BrandColors.light.error,
    borderRadius: 8,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
  },
  signOutText: { color: BrandColors.light.error, fontWeight: '700', fontSize: 14 },
});
