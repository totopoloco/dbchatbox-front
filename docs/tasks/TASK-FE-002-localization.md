# TASK-FE-002: Localization (i18n)

**Spec reference:** `FrontendSpec.md` → §3 Design System / §7 Domain Screens  
**Status:** Not started  
**Depends on:** TASK-FE-001 (app shell complete)

---

## Goal

Add full multi-language support to the WAT Simmering portal. Every user-visible string in the app
must be served from a translation catalogue rather than hard-coded in components. The language
switcher must be accessible at all times — on the public landing page, inside the authenticated
portal, and on the login screen — without requiring a page reload.

**Languages in scope for this task:**

| Code  | Language |
|-------|----------|
| `de`  | German *(default — the club's home language)* |
| `en`  | English |
| `es`  | Spanish |
| `fr`  | French |
| `it`  | Italian |

---

## Background & Decisions

### Library choice

Use **`expo-localization`** (already installed) together with **`i18n-js`** (lightweight,
no native module required, works in Expo managed workflow and on the web).  
Do **not** use `react-i18next` — it requires additional Webpack/Metro aliases that conflict with
the current Apollo v3 Metro setup.

Install: `npx expo install i18n-js`

### Default language

1. On first load, detect the browser/OS locale via `expo-localization`'s
   `getLocales()[0].languageTag`. If the detected locale starts with one of the five supported
   language codes, use it. Otherwise fall back to `de`.
2. Persist the user's manual selection to `AsyncStorage` under the key
   `@watsimmering/lang` so the preference survives page refreshes.

### Translation file structure

All translation catalogues live in `lib/i18n/`:

```
lib/
  i18n/
    index.ts          ← configures i18n-js, exports the `t()` helper and the locale context
    de.ts             ← German strings (source of truth — write German first)
    en.ts             ← English strings
    es.ts             ← Spanish strings
    fr.ts             ← French strings
    it.ts             ← Italian strings
```

Each locale file exports a plain TypeScript object with the same shape. The German file is the
canonical source; every key that exists in `de.ts` must exist in every other locale file (the
TypeScript type system must enforce this via a shared `TranslationSchema` type exported from
`lib/i18n/index.ts`).

### Context & hook

Export a `LocaleProvider` component and a `useLocale()` hook from `lib/i18n/index.ts`:

```ts
type LocaleContextValue = {
  locale: SupportedLocale;             // 'de' | 'en' | 'es' | 'fr' | 'it'
  setLocale: (l: SupportedLocale) => void;
  t: (key: TranslationKey) => string;
};
```

Wrap the app in `<LocaleProvider>` inside `app/_layout.tsx` (inside `<AuthProvider>`, outside
`<ThemeProvider>`).

---

## Task List

### T1 — Install `i18n-js`

Run `npx expo install i18n-js`. Verify it appears in `package.json` dependencies.  
No code changes yet.

---

### T2 — Create translation catalogue files

**Files:** `lib/i18n/de.ts`, `lib/i18n/en.ts`, `lib/i18n/es.ts`, `lib/i18n/fr.ts`, `lib/i18n/it.ts`

Create one file per language. Every file must cover **all** of the following namespaced keys:

#### `nav` namespace — top navigation bar

| Key | German (de) |
|-----|-------------|
| `nav.badminton` | Badminton |
| `nav.training` | Trainingszeiten |
| `nav.membership` | Mitglied werden |
| `nav.contact` | Kontakt |
| `nav.myPortal` | Mein Portal |
| `nav.signIn` | Anmelden |

#### `hero` namespace — landing page hero block

| Key | German (de) |
|-----|-------------|
| `hero.eyebrow` | BADMINTON BEIM |
| `hero.heading` | WAT SIMMERING |
| `hero.tagline` | Österreichs größter Badmintonverein seit 1962 |
| `hero.ctaPortal` | Zum Mitgliederportal |
| `hero.ctaMember` | Mitglied werden |
| `hero.ctaTraining` | Trainingszeiten ansehen |
| `hero.statFounded` | GEGRÜNDET |
| `hero.statMembers` | MITGLIEDER |
| `hero.statLeague` | BUNDESLIGA |

#### `training` namespace — Trainingszeiten section

| Key | German (de) |
|-----|-------------|
| `training.pill` | TRAININGSZEITEN |
| `training.heading` | Unsere Trainingszeiten |
| `training.lead` | Dem WAT Simmering stehen von September bis Juni (an Schultagen) Trainings- und Spielmöglichkeiten an mehreren Wochentagen zur Verfügung. |

#### `membership` namespace — Mitglied werden section

| Key | German (de) |
|-----|-------------|
| `membership.pill` | DER VEREIN |
| `membership.heading` | Mitglied werden |
| `membership.lead` | Werde Mitglied bei Österreichs größtem Badmintonverein! Egal ob Top-Spieler, ambitionierter Hobbyspieler, Nachwuchsspieler oder passives Mitglied — dein Beitrag unterstützt unseren Nachwuchs. |
| `membership.step1Title` | Probetraining |
| `membership.step1Body` | Schreib uns eine E-Mail und vereinbare ein kostenloses Probetraining. |
| `membership.step2Title` | Anmeldung |
| `membership.step2Body` | Füll das Anmeldeformular aus und zahle den Mitgliedsbeitrag ein. |
| `membership.step3Title` | Mitglied! |
| `membership.step3Body` | Deine Mitgliedschaft beginnt — viel Spaß beim Badminton! |
| `membership.ctaPortal` | Zum Mitgliederbereich |
| `membership.ctaSignUp` | Jetzt anmelden |

#### `contact` namespace — Kontakt section

| Key | German (de) |
|-----|-------------|
| `contact.pill` | KONTAKT |
| `contact.heading` | So erreichst du uns |
| `contact.phone` | Telefon |
| `contact.email` | E-Mail |
| `contact.instagram` | Instagram |
| `contact.socialMedia` | Facebook / YouTube |

#### `footer` namespace

| Key | German (de) |
|-----|-------------|
| `footer.tagline` | ÖSTERREICHS GRÖSSTER BADMINTONVEREIN |
| `footer.imprint` | Impressum |
| `footer.privacy` | Datenschutz |
| `footer.contact` | Kontakt |

#### `login` namespace — login screen

| Key | German (de) |
|-----|-------------|
| `login.title` | Anmelden |
| `login.subtitle` | Wähle deine Rolle, um auf das Mitgliederportal zuzugreifen. |
| `login.roleLabel` | Rolle auswählen |
| `login.roleAdmin` | Administrator |
| `login.roleAdminDesc` | Vollzugriff auf alle Vereinsdaten |
| `login.roleMember` | Mitglied |
| `login.roleMemberDesc` | Eigene Mitgliedschaft, Buchungen & Zahlungen |
| `login.roleTrainer` | Trainer |
| `login.roleTrainerDesc` | Trainingseinheiten, Stunden & Verdienst |
| `login.memberIdLabel` | Mitglieds-ID (optional) |
| `login.memberIdPlaceholder` | z. B. M-1042 |
| `login.trainerIdLabel` | Trainer-ID (optional) |
| `login.trainerIdPlaceholder` | z. B. T-0021 |
| `login.submit` | Anmelden |
| `login.phaseNote` | Phase 1 — Rollenauswahl ohne echte Authentifizierung. JWT folgt in Phase 2. |

#### `tabs` namespace — bottom tab bar labels

| Key | German (de) |
|-----|-------------|
| `tabs.chat` | Chat |
| `tabs.dashboard` | Dashboard |
| `tabs.members` | Mitglieder |
| `tabs.sessions` | Trainings |
| `tabs.trainers` | Trainer |
| `tabs.profile` | Profil |

#### `common` namespace — reusable labels

| Key | German (de) |
|-----|-------------|
| `common.comingSoon` | Demnächst verfügbar |
| `common.language` | Sprache |

---

### T3 — Create `lib/i18n/index.ts`

**File:** `lib/i18n/index.ts`

1. Define `SupportedLocale = 'de' | 'en' | 'es' | 'fr' | 'it'` and
   `SUPPORTED_LOCALES: SupportedLocale[]`.
2. Define `TranslationSchema` as the TypeScript type of the German catalogue object. Every other
   locale file must satisfy `TranslationSchema` (enforce at the import site, not with `as`).
3. Configure `i18n-js` with all five catalogues.
4. Implement `LocaleProvider`:
   - On mount, read `AsyncStorage.getItem('@watsimmering/lang')`. If found and valid, use it.
     Otherwise detect via `getLocales()[0].languageTag` and fall back to `'de'`.
   - `setLocale(l)` updates `i18n.locale`, persists to `AsyncStorage`, and triggers a re-render.
5. Implement `useLocale()` — returns `{ locale, setLocale, t }`.
6. Export a standalone `t(key)` function that wraps `i18n.t(key)` for use outside React
   components (e.g. static data arrays).

---

### T4 — Language switcher component `components/ui/language-switcher.tsx`

**File:** `components/ui/language-switcher.tsx`

A compact, self-contained dropdown/picker that renders the current locale flag + code and opens a
list of the five options on press.

Requirements:
- On **web**: render as an inline `<select>` element (native browser select, no custom styling
  library needed) using `Platform.OS === 'web'` guard. Wrap in a styled `<View>` that matches the
  nav bar aesthetic (charcoal background variant, gold text).
- On **native** (future): render a `<Pressable>` that opens an `ActionSheet`-style modal — stub
  this out with a `console.warn('native picker not yet implemented')` for now.
- Display: a globe icon (`public` from MaterialIcons) + the uppercased locale code
  (`DE`, `EN`, `ES`, `FR`, `IT`).
- Props: none — reads and writes locale via `useLocale()`.
- Must work inside the nav bar (height-constrained, dark background) and also as a standalone
  element on the login screen.

---

### T5 — Add `LanguageSwitcher` to the public landing page nav bar

**File:** `app/index.tsx`

Place `<LanguageSwitcher />` at the right end of the nav bar (replacing the empty right slot that
exists today). All hard-coded strings in `index.tsx` must be replaced with `t(key)` calls.

Strings to migrate: all `nav.*`, `hero.*`, `training.*`, `membership.*`, `contact.*`, and
`footer.*` keys.

The venue training schedule data (days, hours, group descriptions) is factual/operational data —
it does **not** need to be translated in this task. Leave it in German as-is.

---

### T6 — Translate `app/(auth)/login.tsx`

**File:** `app/(auth)/login.tsx`

Replace all hard-coded strings with `t('login.*')` calls using the keys defined in T2.  
The `ROLES` array must be rebuilt using `t()` so role labels and descriptions update live when the
locale changes.

---

### T7 — Translate tab labels in `app/(tabs)/_layout.tsx`

**File:** `app/(tabs)/_layout.tsx`

Replace the hard-coded `title` strings on each `<Tabs.Screen>` with `t('tabs.*')` keys.  
Because `_layout.tsx` is not re-rendered on locale change by default, use `useLocale()` and
pass the result of `t(key)` as the `title` prop to force updates.

---

### T8 — Translate placeholder tab screens

**Files:** `app/(tabs)/dashboard.tsx`, `members.tsx`, `sessions.tsx`, `trainers.tsx`, `profile.tsx`

Replace `"coming soon"` strings with `t('common.comingSoon')`.

---

### T9 — Wire `LocaleProvider` into root layout

**File:** `app/_layout.tsx`

Import and add `<LocaleProvider>` to the provider stack. Correct nesting order (outermost first):

```
<ApolloProvider>
  <LocaleProvider>
    <AuthProvider>
      <ThemeProvider>
        <Stack> … </Stack>
      </ThemeProvider>
    </AuthProvider>
  </LocaleProvider>
</ApolloProvider>
```

---

### T10 — TypeScript & lint validation

Run `npm run typecheck` and `npm run lint`. Zero errors required before the task is considered
done.

---

## Acceptance Criteria

- [ ] Visiting the public landing page, the default language is German (or the OS locale if
  supported).
- [ ] The language switcher is visible in the nav bar at all times.
- [ ] Selecting a different language immediately updates all visible strings without a page reload.
- [ ] Refreshing the browser preserves the previously selected language.
- [ ] All five languages display correct translations for every string listed in T2.
- [ ] `npm run typecheck` exits 0.
- [ ] `npm run lint` exits 0.
- [ ] `npm run build:web` exits 0.

---

## Out of Scope

- Translation of dynamic data fetched from the GraphQL API (member names, session titles, etc.)
- Right-to-left (RTL) layout support
- Pluralization rules (use simple singular/plural string pairs if needed)
- Translation of the chat assistant's responses (those come from the backend)
