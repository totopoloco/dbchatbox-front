import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { BrandColors } from '@/constants/theme';
import { type SupportedLocale, SUPPORTED_LOCALES, useLocale } from '@/lib/i18n';

const LOCALE_OPTIONS: { locale: SupportedLocale; flag: string; label: string }[] = [
  { locale: 'de', flag: '🇩🇪', label: 'DE' },
  { locale: 'en', flag: '🇬🇧', label: 'EN' },
  { locale: 'es', flag: '🇪🇸', label: 'ES' },
  { locale: 'fr', flag: '🇫🇷', label: 'FR' },
  { locale: 'it', flag: '🇮🇹', label: 'IT' },
];

// Prevent "unused import" warning
void SUPPORTED_LOCALES;

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const current = LOCALE_OPTIONS.find(o => o.locale === locale) ?? LOCALE_OPTIONS[0];

  if (Platform.OS === 'web') {
    return (
      <View style={s.wrap}>
        {/* Visible label — flag + code + chevron */}
        <View style={s.label} pointerEvents="none">
          <Text style={s.flagText}>{current.flag}</Text>
          <Text style={s.codeText}>{current.label}</Text>
          <MaterialIcons name="expand-more" size={14} color={BrandColors.light.primary} />
        </View>
        {/* Transparent <select> overlaid on top — browser handles the dropdown */}
        <select
          value={locale}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setLocale(e.target.value as SupportedLocale)
          }
          style={webSelectStyle}>
          {LOCALE_OPTIONS.map(({ locale: l, flag, label }) => (
            <option key={l} value={l}>
              {flag} {label}
            </option>
          ))}
        </select>
      </View>
    );
  }

  // Native — display only (ActionSheet in a later phase)
  return (
    <View style={s.wrap}>
      <View style={s.label}>
        <Text style={s.flagText}>{current.flag}</Text>
        <Text style={s.codeText}>{current.label}</Text>
        <MaterialIcons name="expand-more" size={14} color={BrandColors.light.primary} />
      </View>
    </View>
  );
}

const webSelectStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  opacity: 0,
  cursor: 'pointer',
  width: '100%',
  height: '100%',
};

const s = StyleSheet.create({
  wrap: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(204,170,113,0.4)',
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  label: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    pointerEvents: 'none',
  } as never,
  flagText: {
    fontSize: 14,
    lineHeight: 18,
  },
  codeText: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.light.primary,
    letterSpacing: 0.5,
  },
});
