# WAT Simmering — Club Management Frontend

> **Work in progress** — this is an ongoing project and more features are actively being developed.

A React Native / Expo web frontend for the WAT Simmering club management system. It digitizes the
daily administration of the Austrian badminton club and surfaces a natural-language AI chat assistant
as its flagship feature.

---

## Tech Stack

| Layer | Library / Version |
|---|---|
| Runtime | Expo ~54.x / React Native 0.81.5 |
| Routing | expo-router ~6.x (file-based) |
| GraphQL | Apollo Client ^3.14.1 |
| i18n | i18n-js ^4.5.3 + expo-localization |
| Persistence | @react-native-async-storage/async-storage |
| Language | TypeScript ~5.9.2 (strict) |
| Linting | ESLint via `expo lint` |

---

## Getting Started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the dev server (web)

   ```bash
   npm run web
   ```

3. Type-check

   ```bash
   npx tsc --noEmit
   ```

4. Lint

   ```bash
   npm run lint
   ```

The GraphQL backend is expected at `http://localhost:8080/graphql`. Override with the
`EXPO_PUBLIC_GRAPHQL_URL` environment variable.

---

## Project Structure

```
app/
  _layout.tsx          Root layout — provider tree
  index.tsx            Public portal landing page (no auth required)
  (auth)/
    _layout.tsx
    login.tsx          Role-select login screen
  (tabs)/
    _layout.tsx        6-tab navigator
    chat.tsx           AI assistant chat (flagship feature)
    dashboard.tsx
    members.tsx
    sessions.tsx
    trainers.tsx
    profile.tsx
components/
  ui/
    language-switcher.tsx   Flag dropdown, all 5 locales
constants/
  theme.ts             Brand colour tokens + spacing scale
lib/
  apollo.ts            Apollo Client instance
  auth-context.tsx     AuthProvider + useAuth hook
  i18n/
    index.tsx          LocaleProvider, useLocale hook, t() function
    de.ts              German translations (source of truth)
    en.ts / es.ts / fr.ts / it.ts
docs/
  FrontendSpec.md      Full phase-1 technical specification
  tasks/               Per-task implementation specs
```

---

## Changelog — May 5 2026

### TASK-FE-002 · Localisation (i18n)

Complete multi-language support across the entire app.

**Languages:** German (default) · English · Spanish · French · Italian

**What was added**

- `lib/i18n/de.ts` — German translation catalogue (source of truth for all keys)
- `lib/i18n/en.ts`, `es.ts`, `fr.ts`, `it.ts` — typed catalogues (`typeof de` enforces identical shape)
- `lib/i18n/index.tsx` — `I18n` instance, `LocaleProvider`, `useLocale()` hook, standalone `t()`,
  `TranslationKey` type (dot-path utility type for compile-time key safety)
- `components/ui/language-switcher.tsx` — compact flag + code dropdown in the nav bar; uses a
  transparent `<select>` overlaid on a branded pill so the layout never shifts
- Locale is auto-detected from the device/browser and persisted in `AsyncStorage`
- All screens translated: portal landing page, login, all 6 tab screens and their nav titles

**Key technical decisions**

- Translation lookup inside `LocaleProvider` reads directly from the imported dictionaries keyed by
  the `locale` state variable — this guarantees React re-renders pick up the new locale immediately
  without relying on the `i18n` singleton's internal state.
- `AsyncStorage` key: `@watsimmering/lang`
- Provider order in `app/_layout.tsx`: `ApolloProvider → LocaleProvider → AuthProvider → ThemeProvider`

---

## Earlier Work

### TASK-FE-001 · App Shell & Chat MVP

- Brand design system (`constants/theme.ts`) — WAT Simmering gold `#CCAA71`, charcoal `#242628`,
  full light/dark token set
- Public portal landing page (`app/index.tsx`) modelled after watsimmering.at — hero, training
  times with venue selector, membership steps, contact, footer
- Auth flow — `AuthContext` (role: admin / member / trainer), `(auth)` stack, branded login screen
- 6-tab navigator with branded nav bar
- AI chat screen — `useLazyQuery` against `query Ask($input: AskInput!)`, typing indicator,
  example prompts, tool-call detail cards
- Apollo Client v3 configured against `EXPO_PUBLIC_GRAPHQL_URL`

---

## Roadmap (upcoming)

- JWT-based authentication (Phase 2)
- Members screen — list, search, profile detail
- Sessions screen — calendar view, booking
- Trainers screen — hours & earnings
- Dashboard — admin analytics
- Native language picker (ActionSheet) for iOS / Android
- Offline support & connectivity handling
- Accessibility audit

---

## Learn More

- [Expo documentation](https://docs.expo.dev/)
- [Apollo Client docs](https://www.apollographql.com/docs/react/)
- [i18n-js docs](https://github.com/fnando/i18n)
- [Frontend Spec](docs/FrontendSpec.md)
