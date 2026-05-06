# Copilot Instructions

This is **db-chatbox-frontend**, a React Native / Expo app for managing an Austrian sports club (_Verein_). It surfaces a natural-language chatbox assistant as its flagship feature and targets web (primary), iOS, and Android.

## Architecture

- **Routing**: File-based via `expo-router` — screens live in [app/](app/). Tab group at `(tabs)/`, auth group at `(auth)/`.
- **Reusable components**: [components/](components/) — platform-aware (`.ios.tsx` variants where needed)
- **Business logic / data**: [lib/](lib/) — Apollo client ([lib/apollo.ts](lib/apollo.ts)), auth context ([lib/auth-context.tsx](lib/auth-context.tsx)), GraphQL operations ([lib/gql/operations/](lib/gql/operations/))
- **i18n**: [lib/i18n/](lib/i18n/) — `i18n-js` with locale files `de.ts`, `en.ts`, `es.ts`, `fr.ts`, `it.ts`
- **Theme / colors**: [constants/theme.ts](constants/theme.ts), hooks in [hooks/](hooks/)

## Key Patterns

### Internationalization (Required)

All user-facing strings must be translated, never hardcoded:

- Add keys to **all** locale files in [lib/i18n/](lib/i18n/)
- Use the i18n instance from [lib/i18n/index.tsx](lib/i18n/index.tsx)

### GraphQL

- Client configured in [lib/apollo.ts](lib/apollo.ts)
- Write `.graphql` operation files in [lib/gql/operations/](lib/gql/operations/)
- Use Apollo hooks (`useQuery`, `useMutation`) in components

### Authentication

- Auth state via `AuthContext` in [lib/auth-context.tsx](lib/auth-context.tsx)
- Protected routes handled in [app/(auth)/](<app/(auth)/>)

### Theming

- Color tokens in [constants/theme.ts](constants/theme.ts)
- Use `useThemeColor` hook from [hooks/use-theme-color.ts](hooks/use-theme-color.ts)
- `ThemedText` / `ThemedView` components handle light/dark automatically

## Commands

```bash
npm run web          # Dev server at localhost:3000 (web)
npm run build:web    # Production web export to dist/
npm run lint         # ESLint via expo lint
npm run typecheck    # TypeScript check (no emit)
```

## File Conventions

- Screens: `app/<name>.tsx` or `app/(group)/<name>.tsx`
- Components: `components/<name>.tsx` (add `.ios.tsx` for iOS-specific variants)
- Hooks: `hooks/use-<name>.ts`
- Assets: [assets/images/](assets/images/)

## Important Notes

- No test framework is configured yet
- Target platforms: web (primary), iOS, Android
- Uses React 19 and React Native 0.81
