import { gql, useMutation } from '@apollo/client';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { BrandColors, Spacing } from '@/constants/theme';
import { DEMO_TENANT_SLUG } from '@/constants/tenant';
import { client } from '@/lib/apollo';
import { getAccessToken, setAccessToken, useAuth } from '@/lib/auth-context';
import { useLocale } from '@/lib/i18n';
import { decodeAccessToken, extractRole } from '@/lib/jwt';

// ─── GraphQL ───────────────────────────────────────────────────────────────────

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      expiresIn
      tokenType
    }
  }
`;

const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      email
      memberId
      trainerId
    }
  }
`;

interface LoginData {
  login: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
  };
}

interface MeData {
  me: {
    id: string;
    username: string;
    email: string | null;
    memberId: string | null;
    trainerId: string | null;
  };
}

// ─── component ─────────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { t } = useLocale();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [login, { loading }] = useMutation<LoginData>(LOGIN_MUTATION);

  const canSubmit = username.trim().length > 0 && password.length > 0 && !loading;

  const handleSignIn = async () => {
    if (!canSubmit) return;
    setErrorMessage(null);

    try {
      const { data } = await login({
        variables: {
          input: { tenantSlug: DEMO_TENANT_SLUG, username: username.trim(), password },
        },
      });
      const result = data?.login;
      if (!result) throw new Error('Empty login response');

      // Attach the token immediately so the follow-up `me` request is authenticated.
      setAccessToken(result.accessToken);

      const claims = decodeAccessToken(result.accessToken);
      const role = claims ? extractRole(claims) : null;
      if (!role) throw new Error('Account has no recognized portal role');

      let me: MeData['me'] | null = null;
      try {
        const meResult = await client.query<MeData>({ query: ME_QUERY, fetchPolicy: 'network-only' });
        me = meResult.data?.me ?? null;
      } catch {
        // Non-fatal — fall back to what we already know from the token/form.
      }

      await signIn({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        tokenType: result.tokenType,
        expiresAt: Date.now() + result.expiresIn * 1000,
        tenantSlug: DEMO_TENANT_SLUG,
        role,
        username: me?.username ?? username.trim(),
        email: me?.email ?? null,
        memberId: me?.memberId ?? null,
        trainerId: me?.trainerId ?? null,
      });

      router.replace('/(tabs)/chat');
    } catch {
      if (getAccessToken()) setAccessToken(null);
      setErrorMessage(t('login.errorGeneric'));
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={20} color="#F4F5F5" />
        </TouchableOpacity>
        <View style={s.headerBrand}>
          <Text style={s.headerWat}>WAT</Text>
          <View style={s.headerBar} />
          <Text style={s.headerSim}>SIMMERING</Text>
        </View>
        <View style={s.backBtnSpacer} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.card}>
          <Text style={s.cardTitle}>{t('login.title')}</Text>
          <Text style={s.cardSubtitle}>{t('login.subtitle')}</Text>

          <View style={s.tenantBadge}>
            <MaterialIcons name="apartment" size={14} color={BrandColors.light.primary} />
            <Text style={s.tenantBadgeText}>{t('login.tenantNote')}</Text>
          </View>

          <View style={s.inputGroup}>
            <Text style={s.fieldLabel}>{t('login.usernameLabel')}</Text>
            <TextInput
              style={s.input}
              placeholder={t('login.usernamePlaceholder')}
              placeholderTextColor={BrandColors.light.onSurfaceVariant}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              editable={!loading}
              accessibilityLabel={t('login.usernameLabel')}
            />
          </View>

          <View style={s.inputGroup}>
            <Text style={s.fieldLabel}>{t('login.passwordLabel')}</Text>
            <TextInput
              style={s.input}
              placeholder={t('login.passwordPlaceholder')}
              placeholderTextColor={BrandColors.light.onSurfaceVariant}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password"
              secureTextEntry
              editable={!loading}
              accessibilityLabel={t('login.passwordLabel')}
              onSubmitEditing={handleSignIn}
            />
          </View>

          {errorMessage !== null && (
            <View style={s.errorBanner}>
              <MaterialIcons name="error-outline" size={16} color={BrandColors.light.error} />
              <Text style={s.errorText}>{errorMessage}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[s.submitBtn, !canSubmit && s.submitBtnDisabled]}
            onPress={handleSignIn}
            disabled={!canSubmit}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={loading ? t('login.submitting') : t('login.submit')}>
            {loading ? (
              <ActivityIndicator color={BrandColors.light.navBar} />
            ) : (
              <Text style={s.submitBtnText}>{t('login.submit')}</Text>
            )}
          </TouchableOpacity>

          <Text style={s.demoNote}>{t('login.demoNote')}</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BrandColors.light.background },
  header: {
    backgroundColor: BrandColors.light.navBar,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
  backBtn: { padding: 4 },
  backBtnSpacer: { width: 28 },
  headerBrand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerWat: { color: BrandColors.light.primary, fontSize: 16, fontWeight: '800', letterSpacing: 2 },
  headerBar: { width: 1, height: 16, backgroundColor: BrandColors.light.primary },
  headerSim: { color: '#F4F5F5', fontSize: 12, fontWeight: '600', letterSpacing: 2 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 480,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: BrandColors.light.onSurface,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: BrandColors.light.onSurfaceVariant,
    marginBottom: 20,
    lineHeight: 20,
  },
  tenantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: BrandColors.light.surfaceVariant,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 24,
  },
  tenantBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: BrandColors.light.onSurfaceVariant,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.light.onSurfaceVariant,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  inputGroup: { marginBottom: 20 },
  input: {
    borderWidth: 1.5,
    borderColor: BrandColors.light.outline,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: BrandColors.light.onSurface,
    backgroundColor: '#fff',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
  },
  errorText: { flex: 1, fontSize: 13, color: BrandColors.light.error, lineHeight: 18 },
  submitBtn: {
    backgroundColor: BrandColors.light.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    marginBottom: 20,
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: BrandColors.light.navBar,
    letterSpacing: 0.3,
  },
  demoNote: {
    fontSize: 11,
    color: BrandColors.light.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 16,
  },
});
