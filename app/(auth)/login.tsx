import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { BrandColors, Spacing } from '@/constants/theme';
import { type Role, useAuth } from '@/lib/auth-context';
import { useLocale } from '@/lib/i18n';

// ─── types ─────────────────────────────────────────────────────────────────────

interface RoleOption {
  role: Role;
  label: string;
  desc: string;
}

// ─── component ─────────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { t } = useLocale();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [memberId, setMemberId] = useState('');
  const [trainerId, setTrainerId] = useState('');

  const ROLES: RoleOption[] = [
    { role: 'admin', label: t('login.roleAdmin'), desc: t('login.roleAdminDesc') },
    { role: 'member', label: t('login.roleMember'), desc: t('login.roleMemberDesc') },
    { role: 'trainer', label: t('login.roleTrainer'), desc: t('login.roleTrainerDesc') },
  ];

  const handleSignIn = () => {
    if (!selectedRole) return;
    signIn(
      selectedRole,
      selectedRole === 'member' ? memberId.trim() || undefined : undefined,
      selectedRole === 'trainer' ? trainerId.trim() || undefined : undefined,
    );
    router.replace('/(tabs)/chat');
  };

  const selectedDesc = ROLES.find(r => r.role === selectedRole)?.desc;

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

          <Text style={s.fieldLabel}>{t('login.roleLabel')}</Text>
          <View style={s.roleRow}>
            {ROLES.map(r => (
              <Pressable
                key={r.role}
                style={({ pressed }) => [
                  s.roleBtn,
                  selectedRole === r.role && s.roleBtnActive,
                  pressed && s.roleBtnPressed,
                ]}
                onPress={() => setSelectedRole(r.role)}>
                <Text style={[s.roleBtnText, selectedRole === r.role && s.roleBtnTextActive]}>
                  {r.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {selectedDesc !== undefined && <Text style={s.roleDesc}>{selectedDesc}</Text>}

          {selectedRole === 'member' && (
            <View style={s.inputGroup}>
              <Text style={s.fieldLabel}>{t('login.memberIdLabel')}</Text>
              <TextInput
                style={s.input}
                placeholder={t('login.memberIdPlaceholder')}
                placeholderTextColor={BrandColors.light.onSurfaceVariant}
                value={memberId}
                onChangeText={setMemberId}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          )}

          {selectedRole === 'trainer' && (
            <View style={s.inputGroup}>
              <Text style={s.fieldLabel}>{t('login.trainerIdLabel')}</Text>
              <TextInput
                style={s.input}
                placeholder={t('login.trainerIdPlaceholder')}
                placeholderTextColor={BrandColors.light.onSurfaceVariant}
                value={trainerId}
                onChangeText={setTrainerId}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          )}

          <TouchableOpacity
            style={[s.submitBtn, !selectedRole && s.submitBtnDisabled]}
            onPress={handleSignIn}
            disabled={!selectedRole}
            activeOpacity={0.85}>
            <Text style={s.submitBtnText}>{t('login.submit')}</Text>
          </TouchableOpacity>

          <Text style={s.phaseNote}>{t('login.phaseNote')}</Text>
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
    marginBottom: 28,
    lineHeight: 20,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.light.onSurfaceVariant,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  roleRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  roleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: BrandColors.light.outline,
    alignItems: 'center',
  },
  roleBtnActive: {
    borderColor: BrandColors.light.primary,
    backgroundColor: BrandColors.light.primary,
  },
  roleBtnPressed: { opacity: 0.8 },
  roleBtnText: { fontSize: 13, fontWeight: '600', color: BrandColors.light.onSurfaceVariant },
  roleBtnTextActive: { color: BrandColors.light.navBar },
  roleDesc: {
    fontSize: 12,
    color: BrandColors.light.onSurfaceVariant,
    marginBottom: 24,
    marginTop: 4,
  },
  inputGroup: { marginBottom: 24, marginTop: 8 },
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
  submitBtn: {
    backgroundColor: BrandColors.light.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: BrandColors.light.navBar,
    letterSpacing: 0.3,
  },
  phaseNote: {
    fontSize: 11,
    color: BrandColors.light.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 16,
  },
});
