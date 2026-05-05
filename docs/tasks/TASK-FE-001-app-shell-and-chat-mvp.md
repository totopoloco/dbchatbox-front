# TASK-FE-001: App Shell & Chat MVP

**Spec reference:** `FrontendSpec.md` → §2 Tech Stack / §3 Design System / §4 Navigation Architecture / §7 Chat (Ask Assistant)
**Status:** Not started

---

## Goal

Bootstrap the minimum valuable product: a fully branded app shell with the WAT Simmering color
palette, a working bottom tab navigator (six tabs — placeholder screens for five of them), and a
functional Chat screen that calls the `ask` GraphQL query against the live backend. After this task
the app can be opened in a browser, it looks on-brand, and a user can type a question and receive
an AI answer.

---

## Task List

### T1 — Replace design tokens in `constants/theme.ts`

**File:** `constants/theme.ts`

Replace the existing `Colors` object with the full WAT Simmering brand token set from the spec
(§3 Color Palette — App token mapping table). Export the following named token objects:

- `BrandColors` — raw hex values for both `light` and `dark` keyed by the token names defined in
  the spec (`primary`, `primaryPressed`, `onPrimary`, `navBar`, `navBarText`, `navBarTextActive`,
  `background`, `surface`, `surfaceVariant`, `onSurface`, `onSurfaceVariant`, `outline`, `error`,
  `onError`, `warning`, `success`, `statusActive`, `statusInactive`, `statusDeleted`,
  `paymentPaid`, `paymentOverdue`, `paymentInReview`).
- Keep the existing `Fonts` export unchanged.
- Keep the existing `Spacing` export (or add it if missing) with values:
  `{ xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 }`.

No changes to any other file in this sub-task.

---

### T2 — Update root layout `app/_layout.tsx`

**File:** `app/_layout.tsx`

Update the root layout to use the new brand tokens for the navigation theme:

- Replace the `DefaultTheme` / `DarkTheme` background colors with `BrandColors.light.background`
  and `BrandColors.dark.background`.
- Set the navigation header text color to `BrandColors.light.onSurface` /
  `BrandColors.dark.onSurface`.
- No other logic changes — keep the existing `Stack`, `StatusBar`, and `useColorScheme` usage.

**Note:** Apollo and Auth providers will be added in later tasks (TASK-FE-002). Keep the layout
minimal for now.

---

### T3 — Rebuild tab layout `app/(tabs)/_layout.tsx`

**File:** `app/(tabs)/_layout.tsx`

Replace the existing two-tab layout with the full six-tab navigator described in the spec. All
tabs use the WAT Simmering brand tokens:

| Tab screen name | Title        | Icon (MaterialIcons name) | Audience note   |
| --------------- | ------------ | ------------------------- | --------------- |
| `chat`          | Chat         | `chat-bubble-outline`     | default tab     |
| `dashboard`     | Dashboard    | `dashboard`               | placeholder     |
| `members`       | Members      | `people-outline`          | placeholder     |
| `sessions`      | Sessions     | `event`                   | placeholder     |
| `trainers`      | Trainers     | `sports`                  | placeholder     |
| `profile`       | Profile      | `person-outline`          | placeholder     |

Tab bar styling:
- `tabBarStyle.backgroundColor` → `BrandColors.light.navBar` (always charcoal `#242628`,
  same in light and dark mode — the site's nav bar does not change with the system theme).
- `tabBarActiveTintColor` → `BrandColors.light.navBarTextActive` (`#CCAA71` gold).
- `tabBarInactiveTintColor` → `BrandColors.light.navBarText` (`#F4F5F5`).
- `tabBarStyle.borderTopWidth` → `0` (remove default 1 px border).
- `headerShown: false` for all screens.

Use `@expo/vector-icons` `MaterialIcons` for all icons (already a dependency).

---

### T4 — Create five placeholder tab screens

**Files (new):**
- `app/(tabs)/dashboard.tsx`
- `app/(tabs)/members.tsx`
- `app/(tabs)/sessions.tsx`
- `app/(tabs)/trainers.tsx`
- `app/(tabs)/profile.tsx`

Each placeholder must:

1. Render a centered `ThemedView` + `ThemedText` showing the screen name (e.g. "Dashboard —
   coming soon").
2. Use `ThemedText` with the `heading2` style variant (22 / semibold).
3. Accept no props and export a default function component.

These screens exist only so the tab bar compiles and navigates without errors. They will be
replaced in subsequent tasks.

---

### T5 — Install Apollo Client

**Files:** `package.json`, `package-lock.json` (via `npm install`)

Install the following packages:

```
npm install @apollo/client graphql
```

No code changes in this sub-task — only dependency installation. Verify the install succeeds and
`node_modules/@apollo/client` exists.

---

### T6 — Create Apollo Client singleton `lib/apollo.ts`

**New file:** `lib/apollo.ts`

Create and export a single `ApolloClient` instance:

```
uri  → process.env.EXPO_PUBLIC_GRAPHQL_URL ?? 'http://localhost:8080/graphql'
cache → InMemoryCache with keyFields: ['id'] on Member, Session, Trainer, TrainerLog,
        MemberSubscription, MembershipType, SessionOccurrence, Payment, PaymentDocument
defaultOptions →
  watchQuery.fetchPolicy: 'cache-and-network'
  query.fetchPolicy: 'cache-and-network'
  mutate.fetchPolicy: 'network-only'
```

No `ApolloProvider` wiring yet — that happens in T7.

---

### T7 — Wire `ApolloProvider` into the root layout

**File:** `app/_layout.tsx`

Import the `client` singleton from `lib/apollo.ts` and wrap the `<ThemeProvider>` tree with
`<ApolloProvider client={client}>`.

The final render tree must be:
```
<ApolloProvider client={client}>
  <ThemeProvider …>
    <Stack>…</Stack>
    <StatusBar …/>
  </ThemeProvider>
</ApolloProvider>
```

---

### T8 — Define Chat GraphQL operation

**New file:** `lib/gql/operations/chat.graphql`

Define one named query:

```graphql
query Ask($input: AskInput!) {
  ask(input: $input) {
    answer
    toolCalls {
      toolName
      summary
    }
  }
}
```

This file is the source of truth for the Chat screen's query. Do not import it directly in
components — it will be used by codegen in a future task. For now the Chat screen in T9 will use
the `gql` tagged template literal with the same document inline (to avoid the codegen setup
dependency).

---

### T9 — Implement the Chat tab screen

**File:** `app/(tabs)/chat.tsx` (replace the current `index.tsx` content if needed, or create new)

**Note:** The existing `app/(tabs)/index.tsx` (the Expo template "Home" screen) is replaced by
`chat.tsx` registered in the tab layout (T3). `index.tsx` can be removed or left as a redirect to
`chat` — removing it is preferred to avoid duplicate routes.

Implement the Chat screen with the following structure:

#### Layout

```
<SafeAreaView> (flex: 1, background: BrandColors.background)
  <FlatList>          ← message history, inverted
  <TypingIndicator>   ← shown only while query is in-flight
  <InputBar>          ← text input + send button, fixed at bottom
</SafeAreaView>
```

#### Message data model (local state only)

```ts
type Role = 'user' | 'assistant';
interface Message {
  id: string;          // Date.now().toString()
  role: Role;
  text: string;
}
```

State: `const [messages, setMessages] = useState<Message[]>([])`.

#### Empty state

When `messages` is empty, render a centered column of four example prompt chips instead of the
`FlatList`. Each chip is a tappable `TouchableOpacity` that pre-fills the input:

1. "Who has unpaid dues?"
2. "When is my next training session?"
3. "How many hours did the trainers work this month?"
4. "Which memberships expire soon?"

#### Message bubbles

- **User** bubble: right-aligned, background `primary` (`#CCAA71`), text `onPrimary` (`#F8FAFC`),
  border-radius 16 (top-left, top-right, bottom-left), no bottom-right radius.
- **Assistant** bubble: left-aligned, background `surfaceVariant`, text `onSurface`,
  border-radius 16 (top-left, top-right, bottom-right), no bottom-left radius.
- Show a small timestamp (`bodySmall`) below each bubble.

#### Typing indicator

Three animated dots (using `react-native-reanimated` `useSharedValue` + `withRepeat` +
`withSequence`) shown while the query is loading. Positioned in the assistant bubble slot.

#### Input bar

- `TextInput`: multiline, max 4 lines, max 1 000 characters, placeholder "Ask anything about the
  club…", background `surface`, border `outline`.
- Character counter: shown when remaining characters ≤ 100, positioned bottom-right of the input.
- Send button: `MaterialIcons` `send` icon, color `primary`, disabled and grayed out when input is
  empty or query is in-flight.
- The input bar sits above the keyboard (`KeyboardAvoidingView` behavior `padding` on iOS,
  `height` on Android).

#### GraphQL wiring

Use Apollo `useLazyQuery` with the inline `gql` document (matching the operation in T8). On send:

1. Append a user `Message` to `messages`.
2. Clear the input.
3. Call the lazy query with `{ variables: { input: { prompt: text, locale: locale } } }` where
   `locale` comes from `expo-localization` (`Localization.locale`).
4. On completion, append an assistant `Message` with `data.ask.answer`.
5. On error, append an assistant `Message` with text "Sorry, something went wrong. Please try
   again." styled with `error` color.

`expo-localization` must be installed if not already present:
```
npm install expo-localization
```

---

### T10 — Remove unused Expo template files

**Files to delete:**
- `app/(tabs)/index.tsx` — replaced by `chat.tsx`
- `app/(tabs)/explore.tsx` — Expo template screen, not in the spec
- `components/hello-wave.tsx` — template component
- `components/parallax-scroll-view.tsx` — template component

Verify the app still compiles and the tab bar shows the six new tabs after deletion.

---

## Acceptance Criteria

- [ ] `npm run web` starts without errors and the app opens in the browser.
- [ ] The tab bar shows six tabs (Chat, Dashboard, Members, Sessions, Trainers, Profile) with the
      charcoal background and gold active tint.
- [ ] Navigating to Dashboard, Members, Sessions, Trainers, and Profile shows the placeholder
      "coming soon" screen without crashing.
- [ ] The Chat screen shows the four example prompt chips when no messages exist.
- [ ] Tapping a chip pre-fills the text input.
- [ ] Typing a question and pressing Send appends a user bubble and then an assistant bubble with
      the response from the backend.
- [ ] While waiting for the backend, the typing indicator (three dots) is visible.
- [ ] Sending with an empty input is not possible (button disabled).
- [ ] The character counter appears when ≤ 100 characters remain.
- [ ] The app uses the WAT Simmering gold (`#CCAA71`) as the active tab color and primary
      action color throughout.
- [ ] No TypeScript errors (`npx tsc --noEmit`).
- [ ] No ESLint errors (`npm run lint`).

---

## Execution Order

T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8 → T9 → T10

(T1 must come first as all subsequent tasks reference `BrandColors`. T5 must precede T6 and T7.
T8 must precede T9. T10 can be done any time after T3 and T4 are in place.)

---

## Dependencies on Future Tasks

| Future task       | What it will add                                                        |
| ----------------- | ----------------------------------------------------------------------- |
| TASK-FE-002       | `graphql-codegen` setup — replaces the inline `gql` in T9 with typed hooks |
| TASK-FE-003       | `AuthContext` + login screen — adds role-based tab filtering            |
| TASK-FE-004       | Members module — replaces `members.tsx` placeholder                     |
| TASK-FE-005       | Dashboard module — replaces `dashboard.tsx` placeholder                 |
| TASK-FE-006       | Sessions module — replaces `sessions.tsx` placeholder                   |
| TASK-FE-007       | Trainers module — replaces `trainers.tsx` placeholder                   |
| TASK-FE-008       | Profile module — replaces `profile.tsx` placeholder                     |
