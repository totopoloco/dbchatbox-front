import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import de from './de';
import en from './en';
import es from './es';
import fr from './fr';
import it from './it';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type SupportedLocale = 'de' | 'en' | 'es' | 'fr' | 'it';
export type TranslationSchema = typeof de;

// Flatten nested keys into dotted paths, e.g. "nav.signIn"
type DotPaths<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends object
    ? DotPaths<T[K], `${Prefix}${K}.`>
    : `${Prefix}${K}`;
}[keyof T & string];

export type TranslationKey = DotPaths<TranslationSchema>;

export const SUPPORTED_LOCALES: SupportedLocale[] = ['de', 'en', 'es', 'fr', 'it'];

const STORAGE_KEY = '@watsimmering/lang';

// ─── i18n instance ─────────────────────────────────────────────────────────────

const i18n = new I18n({
  de,
  en,
  es,
  fr,
  it,
});

i18n.enableFallback = true;
i18n.defaultLocale = 'de';
i18n.locale = 'de';

// ─── Standalone t() ────────────────────────────────────────────────────────────

export function t(key: TranslationKey): string {
  return i18n.t(key);
}

// ─── Context ───────────────────────────────────────────────────────────────────

interface LocaleContextValue {
  locale: SupportedLocale;
  setLocale: (l: SupportedLocale) => void;
  t: (key: TranslationKey) => string;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'de',
  setLocale: () => undefined,
  t,
});

// ─── Provider ──────────────────────────────────────────────────────────────────

function detectLocale(): SupportedLocale {
  try {
    const tag = getLocales()[0]?.languageTag ?? '';
    const code = tag.slice(0, 2).toLowerCase();
    if ((SUPPORTED_LOCALES as string[]).includes(code)) {
      return code as SupportedLocale;
    }
  } catch {
    // ignore
  }
  return 'de';
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>('de');

  // Load persisted or detected locale on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored: string | null) => {
        if (stored && (SUPPORTED_LOCALES as string[]).includes(stored)) {
          const l = stored as SupportedLocale;
          i18n.locale = l;
          setLocaleState(l);
        } else {
          const detected = detectLocale();
          i18n.locale = detected;
          setLocaleState(detected);
        }
      })
      .catch(() => {
        const detected = detectLocale();
        i18n.locale = detected;
        setLocaleState(detected);
      });
  }, []);

  const setLocale = useCallback((l: SupportedLocale) => {
    i18n.locale = l; // keep singleton in sync for standalone t()
    setLocaleState(l);
    AsyncStorage.setItem(STORAGE_KEY, l).catch(() => undefined);
  }, []);

  // Translate directly from the imported dictionaries, capturing `locale`
  // explicitly in the closure so the function body changes when locale changes.
  const tBound = useCallback(
    (key: TranslationKey): string => {
      const dicts = { de, en, es, fr, it };
      const dict = dicts[locale] as Record<string, unknown>;
      const parts = key.split('.');
      let node: unknown = dict;
      for (const part of parts) {
        if (node == null || typeof node !== 'object') return key;
        node = (node as Record<string, unknown>)[part];
      }
      return typeof node === 'string' ? node : key;
    },
    [locale],
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: tBound }}>
      {children}
    </LocaleContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}
