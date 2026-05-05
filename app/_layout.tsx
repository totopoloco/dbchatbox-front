import { ApolloProvider } from '@apollo/client';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { BrandColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { client } from '@/lib/apollo';
import { AuthProvider } from '@/lib/auth-context';
import { LocaleProvider } from '@/lib/i18n';

const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: BrandColors.light.background,
    text: BrandColors.light.onSurface,
  },
};

const AppDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: BrandColors.dark.background,
    text: BrandColors.dark.onSurface,
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ApolloProvider client={client}>
      <LocaleProvider>
        <AuthProvider>
          <ThemeProvider value={colorScheme === 'dark' ? AppDarkTheme : LightTheme}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </AuthProvider>
      </LocaleProvider>
    </ApolloProvider>
  );
}
