# Club Management Frontend — Phase 1 Specification

> Technical specification for the React Native / Expo web frontend that consumes the Club Management
> GraphQL API. The frontend digitizes the daily administration of an Austrian sports club (_Verein_)
> and surfaces a natural-language chatbox assistant as its flagship feature.

---

## Table of Contents

1. [Problem Statement](#problem-statement)
   - [Scope](#scope)
   - [Target Platforms](#target-platforms)
2. [Tech Stack](#tech-stack)
   - [Core Runtime](#core-runtime)
   - [Navigation](#navigation)
   - [GraphQL Client](#graphql-client)
   - [State Management](#state-management)
   - [UI & Styling](#ui--styling)
   - [Dev Tooling](#dev-tooling)
3. [Design System](#design-system)
   - [Color Palette](#color-palette)
   - [Typography](#typography)
   - [Spacing Scale](#spacing-scale)
   - [Component Conventions](#component-conventions)
4. [Navigation Architecture](#navigation-architecture)
   - [Route Tree](#route-tree)
   - [Role-Driven Tab Visibility](#role-driven-tab-visibility)
   - [Stack Screens](#stack-screens)
5. [Authentication & Session](#authentication--session)
6. [GraphQL Integration](#graphql-integration)
   - [Client Configuration](#client-configuration)
   - [Code Generation](#code-generation)
   - [Operation Conventions](#operation-conventions)
7. [Domain Screens](#domain-screens)
   - [Chat (Ask Assistant)](#chat-ask-assistant)
   - [Members](#members)
   - [Subscriptions & Payments](#subscriptions--payments)
   - [Membership Types](#membership-types)
   - [Sessions](#sessions)
   - [Trainers](#trainers)
   - [Dashboard (Admin)](#dashboard-admin)
   - [Profile](#profile)
8. [Shared UI Components](#shared-ui-components)
9. [Error Handling & Loading States](#error-handling--loading-states)
10. [Offline & Connectivity](#offline--connectivity)
11. [Accessibility](#accessibility)
12. [Rules & Edge Cases](#rules--edge-cases)
13. [Architecture Notes](#architecture-notes)
    - [Directory Structure](#directory-structure)
    - [Environment Variables](#environment-variables)
    - [Build Configuration](#build-configuration)

---

## Problem Statement

The backend (Spring Boot + GraphQL) exposes a complete API for managing club members, memberships,
payments, sessions, trainer hours, and a natural-language AI assistant. The frontend must give three
audiences — **admins**, **members**, and **trainers** — a purpose-built, mobile-ready interface to
interact with that API.

Phase 1 focuses on web-first delivery via Expo's web renderer while preserving full cross-platform
readiness so the same codebase can be shipped to iOS and Android in a future phase.

### Scope

Phase 1 delivers the following modules:

| Module                    | Audience          | Responsibility                                                              |
| ------------------------- | ----------------- | --------------------------------------------------------------------------- |
| **Chat Assistant**        | All roles         | Natural-language Q&A over club data via the `ask` GraphQL query             |
| **Members**               | Admin             | List, search, register, edit, deactivate, GDPR-delete members               |
| **Subscriptions**         | Admin, Member     | List subscriptions, create new, end early, view payment status              |
| **Payments**              | Admin, Member     | Record payments, upload proof documents, admin review workflow              |
| **Membership Types**      | Admin             | Create, transition status (DRAFT → ACTIVE → INACTIVE), assign sessions      |
| **Sessions**              | Admin, Member     | List sessions, view/create occurrences, cancel/complete, member calendar    |
| **Trainers**              | Admin, Trainer    | Register trainers, update settings, log/approve/reject hours, pay summaries |
| **Dashboard**             | Admin             | Outstanding payments, overdue subscriptions, pending reviews, pending logs  |
| **Profile**               | All roles         | View own details, change theme preference                                   |

### Target Platforms

| Platform | Phase 1 | Notes                                                 |
| -------- | ------- | ----------------------------------------------------- |
| Web      | ✅       | Primary delivery target; `expo start --web`           |
| iOS      | ⬜       | Codebase is compatible; no platform-specific work yet |
| Android  | ⬜       | Codebase is compatible; no platform-specific work yet |

---

## Tech Stack

### Core Runtime

| Dependency            | Version  | Role                                          |
| --------------------- | -------- | --------------------------------------------- |
| `expo`                | ~54.x    | Managed workflow, build toolchain             |
| `expo-router`         | ~6.x     | File-system-based routing (Expo Router v3+)   |
| `react`               | 19.x     | UI runtime                                    |
| `react-native`        | 0.81.x   | Cross-platform rendering                      |
| `react-native-web`    | ~0.21.x  | Web renderer for React Native components      |
| `typescript`          | ~5.9.x   | Static typing                                 |

### Navigation

Expo Router v3 with a **tab + stack** hybrid:

- `app/(tabs)/` — bottom-tab group, role-filtered at runtime.
- `app/(admin)/` — admin-only stack screens pushed from tabs.
- `app/(member)/` — member-only stack screens.
- `app/(trainer)/` — trainer-only stack screens.
- `app/modal.tsx` — shared modal slot (confirmation dialogs, pickers).

### GraphQL Client

| Library                           | Role                                                               |
| --------------------------------- | ------------------------------------------------------------------ |
| `@apollo/client`                  | GraphQL client — query/mutation/subscription, normalized cache     |
| `@graphql-codegen/cli`            | Generates typed hooks and types from `schema.graphqls`             |
| `@graphql-codegen/typescript`     | TypeScript types for schema scalars and output types               |
| `@graphql-codegen/typescript-operations` | Types for every `.graphql` operation file               |
| `@graphql-codegen/typescript-react-apollo` | Typed `useQuery` / `useMutation` hooks per operation    |

### State Management

- **Server state**: Apollo Client's normalized in-memory cache is the primary server-state store.
  Components read directly from the cache via generated hooks; no additional Redux or Zustand layer
  for server data.
- **UI / local state**: React `useState` and `useReducer` for component-local state (form values,
  modal open/closed, filter selections).
- **Auth state**: A single `AuthContext` (React Context + `useReducer`) holds `{ role, memberId?,
  trainerId? }`. Populated from the login response; persisted to `AsyncStorage` via `expo-secure-store`
  in a future phase.

### UI & Styling

| Library                         | Role                                                                    |
| ------------------------------- | ----------------------------------------------------------------------- |
| `@expo/vector-icons`            | Icon set (MaterialIcons + SF Symbols on iOS)                            |
| `react-native-reanimated`       | Animated transitions (tab indicator, chat bubble enter)                 |
| `react-native-gesture-handler`  | Swipe-to-delete on list items, pull-to-refresh                          |
| `react-native-safe-area-context`| Safe area insets on notched devices                                     |

Styling is done with **React Native `StyleSheet`** (no third-party CSS-in-JS). A shared design token
file (`constants/theme.ts`) exports colors, typography, and spacing. This keeps the codebase
consistent without adding a heavy styling library.

### Dev Tooling

| Tool                | Role                                          |
| ------------------- | --------------------------------------------- |
| `eslint-config-expo`| Linting rules pre-configured for Expo/RN      |
| `prettier`          | Code formatting                               |
| `jest` + `@testing-library/react-native` | Unit and component tests    |
| Expo Go             | QR-code preview on physical devices           |
| Expo Dev Client     | Custom native build for plugins               |

---

## Design System

### Color Palette

Derived directly from the WAT Simmering brand (`watsimmering.at` CSS custom properties,
inspected May 2026). The site uses a Tailwind/Shadcn token system; the values below are the
resolved hex equivalents.

**Brand colors (source CSS variables → hex)**

| CSS variable (site)        | HSL value          | Hex       | Description                              |
| -------------------------- | ------------------ | --------- | ---------------------------------------- |
| `--primary`                | `38 47% 62%`       | `#CCAA71` | Club gold — the signature brand colour   |
| `--primary-foreground`     | `210 40% 98%`      | `#F8FAFC` | Text / icons on gold surfaces            |
| `--secondary`              | `210 5% 15%`       | `#242628` | Dark charcoal — nav bar, hero overlay    |
| `--secondary-foreground`   | `180 5% 96%`       | `#F4F5F5` | Text / icons on dark charcoal surfaces   |
| `--background`             | `0 0% 100%`        | `#FFFFFF` | Page background (light mode)             |
| `--foreground`             | `210 5% 5%`        | `#0C0D0D` | Primary body text (light mode)           |
| `--muted`                  | `210 40% 96.1%`    | `#F1F5F9` | Muted/subtle backgrounds                 |
| `--muted-foreground`       | `215.4 16.3% 46.9%`| `#64748B` | Secondary / helper text                  |
| `--destructive`            | `0 84.2% 60.2%`    | `#EF4444` | Errors, destructive actions              |
| `--destructive-foreground` | `210 40% 98%`      | `#F8FAFC` | Text on destructive (red) surfaces       |
| `--border`                 | `214.3 31.8% 91.4%`| `#E2E8F0` | Dividers, input borders                  |
| `--card`                   | `0 0% 100%`        | `#FFFFFF` | Card surface background                  |
| `--card-foreground`        | `222.2 84% 4.9%`   | `#020817` | Text on card surfaces                    |

**App token mapping** (what `constants/theme.ts` exports)

| Token                  | Light       | Dark        | Source token(s)                          | Usage                                  |
| ---------------------- | ----------- | ----------- | ---------------------------------------- | -------------------------------------- |
| `primary`              | `#CCAA71`   | `#CCAA71`   | `--primary`                              | Primary CTA, active tab, key links     |
| `primaryPressed`       | `#B8925A`   | `#B8925A`   | `--primary` darkened ~12%                | Pressed / hover state on gold elements |
| `onPrimary`            | `#F8FAFC`   | `#F8FAFC`   | `--primary-foreground`                   | Text and icons on gold surfaces        |
| `navBar`               | `#242628`   | `#242628`   | `--secondary`                            | Navigation bar background              |
| `navBarText`           | `#F4F5F5`   | `#F4F5F5`   | `--secondary-foreground`                 | Inactive nav labels                    |
| `navBarTextActive`     | `#CCAA71`   | `#CCAA71`   | `--primary`                              | Active tab label and icon              |
| `background`           | `#FFFFFF`   | `#1A1C1D`   | `--background` / dark variant            | Screen / page background               |
| `surface`              | `#FFFFFF`   | `#242628`   | `--card` / `--secondary`                 | Card and sheet surfaces                |
| `surfaceVariant`       | `#F1F5F9`   | `#2E3032`   | `--muted` / dark variant                 | List item and input backgrounds        |
| `onSurface`            | `#0C0D0D`   | `#F4F5F5`   | `--foreground` / `--secondary-foreground`| Primary body text                      |
| `onSurfaceVariant`     | `#64748B`   | `#94A3B8`   | `--muted-foreground` / dark variant      | Secondary / helper text                |
| `outline`              | `#E2E8F0`   | `#3A3C3E`   | `--border` / dark variant                | Borders, input underlines, dividers    |
| `error`                | `#EF4444`   | `#FCA5A5`   | `--destructive` / light tint             | Validation errors, destructive CTAs    |
| `onError`              | `#F8FAFC`   | `#450A0A`   | `--destructive-foreground` / dark text   | Text on error surfaces                 |
| `warning`              | `#D97706`   | `#FCD34D`   | Semantic (not in site CSS)               | Grace-period badges, overdue warnings  |
| `success`              | `#15803D`   | `#86EFAC`   | Semantic (not in site CSS)               | Paid / active / approved indicators    |
| `statusActive`         | `#15803D`   | `#86EFAC`   | `success`                                | ACTIVE member / subscription badge     |
| `statusInactive`       | `#64748B`   | `#94A3B8`   | `onSurfaceVariant`                       | INACTIVE member badge                  |
| `statusDeleted`        | `#EF4444`   | `#FCA5A5`   | `error`                                  | DELETED member badge                   |
| `paymentPaid`          | `#15803D`   | `#86EFAC`   | `success`                                | Payment REVIEWED / paid badge          |
| `paymentOverdue`       | `#EF4444`   | `#FCA5A5`   | `error`                                  | Overdue payment badge                  |
| `paymentInReview`      | `#D97706`   | `#FCD34D`   | `warning`                                | Payment IN_REVIEW badge                |

> **Note on dark mode**: The WAT Simmering website is light-mode only; there is no dark theme in
> the source CSS. Dark-mode tokens are derived by keeping the brand gold unchanged, switching the
> page/card backgrounds to the site's dark charcoal (`#242628` / `#1A1C1D`), and inverting text
> to the near-white `#F4F5F5`. Semantic colors (success, warning, error) use lighter tints for
> legibility on dark backgrounds.

### Typography

| Token          | Web value                                          | Usage                    |
| -------------- | -------------------------------------------------- | ------------------------ |
| `heading1`     | 28 / bold / sans-serif                             | Screen titles            |
| `heading2`     | 22 / semibold / sans-serif                         | Section headings         |
| `heading3`     | 18 / semibold / sans-serif                         | Card titles              |
| `body`         | 15 / regular / sans-serif                          | List items, descriptions |
| `bodySmall`    | 13 / regular / sans-serif                          | Helper text, timestamps  |
| `label`        | 12 / medium / sans-serif / uppercase + 0.5px ls   | Form labels, badge text  |
| `mono`         | 13 / regular / monospace                           | IDs, dates in raw form   |

### Spacing Scale

```
2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64   (in dp / px)
```

Exported as `Spacing` object from `constants/theme.ts` (e.g. `Spacing.md = 16`).

### Component Conventions

- All primitive components live in `components/ui/`.
- Screen-level layout components live in `components/`.
- Every component that accepts a `testID` prop must pass it to the root element.
- Components must support light and dark mode via `useThemeColor`.
- No inline styles on primitive components — always `StyleSheet.create`.

---

## Navigation Architecture

### Route Tree

```
app/
├── _layout.tsx                   Root layout — ApolloProvider, AuthProvider, ThemeProvider
├── (auth)/
│   ├── _layout.tsx               Auth stack (no tab bar)
│   ├── login.tsx                 Login screen
│   └── select-role.tsx           Phase 1: manual role selector (no real auth server yet)
├── (tabs)/
│   ├── _layout.tsx               Tab bar — role-filtered tabs
│   ├── chat.tsx                  Chat assistant (all roles)
│   ├── dashboard.tsx             Admin dashboard (admin only)
│   ├── members.tsx               Member list (admin only)
│   ├── sessions.tsx              Session calendar / list (admin + member)
│   ├── trainers.tsx              Trainer list (admin only)
│   └── profile.tsx               Profile (all roles)
├── (admin)/
│   ├── members/
│   │   ├── [id].tsx              Member detail
│   │   ├── new.tsx               Register member
│   │   └── [id]/
│   │       ├── subscriptions.tsx Subscriptions for member
│   │       └── payments.tsx      Payments for member
│   ├── membership-types/
│   │   ├── index.tsx             Membership type list
│   │   ├── new.tsx               Create membership type
│   │   └── [id].tsx              Membership type detail + session assignment
│   ├── sessions/
│   │   ├── new.tsx               Create session
│   │   └── [id]/
│   │       └── occurrences.tsx   Occurrences list + bulk create
│   └── trainers/
│       ├── new.tsx               Register trainer
│       ├── [id].tsx              Trainer detail + settings
│       └── [id]/
│           ├── hours.tsx         Pending logs approval
│           └── payment.tsx       Payment summary
├── (member)/
│   ├── my-sessions.tsx           Member's upcoming sessions
│   ├── my-subscriptions.tsx      Active subscriptions
│   └── my-payments/
│       ├── [subscriptionId].tsx  Payment detail + upload document
│       └── documents.tsx         Document list
├── (trainer)/
│   ├── my-sessions.tsx           Trainer's assigned sessions
│   ├── log-hours.tsx             Submit / resubmit hours form
│   └── my-earnings.tsx           TrainerPaymentSummary screen
└── modal.tsx                     Shared modal (confirm dialog, status picker)
```

### Role-Driven Tab Visibility

The `(tabs)/_layout.tsx` reads the current role from `AuthContext` and renders only the tabs
appropriate for that role:

| Tab           | Admin | Member | Trainer |
| ------------- | ----- | ------ | ------- |
| Chat          | ✅    | ✅     | ✅      |
| Dashboard     | ✅    | ❌     | ❌      |
| Members       | ✅    | ❌     | ❌      |
| Sessions      | ✅    | ✅     | ❌      |
| My Sessions   | ❌    | ✅     | ✅      |
| Trainers      | ✅    | ❌     | ❌      |
| Profile       | ✅    | ✅     | ✅      |

> **Note**: Authentication is real. The login screen (`(auth)/login.tsx`) collects username +
> password, calls the `login` mutation against a tenant locked to `wat-simmering` for this demo,
> and derives `role` from the `realm_access.roles` claim on the returned access token (Keycloak).
> `memberId` / `trainerId` come from the authenticated `me` query, not manual entry.

### Stack Screens

Screens under `(admin)/`, `(member)/`, and `(trainer)/` are pushed on top of the tab navigator
using `expo-router`'s `<Link>` with `push`. The back button always returns to the originating tab.

---

## Authentication & Session

| Concern                | Current approach                                                          |
| ---------------------- | ------------------------------------------------------------------------- |
| Identity               | `login(input: LoginInput!)` mutation — `tenantSlug` locked to `wat-simmering` for this demo, `username` + `password` from the form. Returns a Keycloak-issued `accessToken` / `refreshToken`. |
| Role                   | Decoded client-side from the access token's `realm_access.roles` claim (`lib/jwt.ts`); mapped to `admin` / `member` / `trainer`. |
| Member/Trainer identity| Fetched via the authenticated `me` query (`CurrentUser.memberId` / `trainerId`) right after login. |
| Session persistence    | `AuthContext` persists the full session to `AsyncStorage`; rehydrated on app boot and dropped if `expiresAt` has passed. |
| Route protection       | `(tabs)/_layout.tsx` redirects to `(auth)/login` when there is no session once `AuthContext` has finished hydrating. |
| GraphQL auth header    | An Apollo `setContext` link (`lib/apollo.ts`) attaches `Authorization: Bearer <accessToken>` to every request once signed in. |
| Sign out               | Clears the Apollo cache (`client.clearStore()`) and the persisted session. |
| Future                 | Automatic refresh via the `refreshToken` mutation before `expiresAt`; a real tenant picker instead of the locked demo slug. |

---

## GraphQL Integration

### Client Configuration

`ApolloClient` is instantiated once in `lib/apollo.ts` and provided via `ApolloProvider` in the
root layout. Configuration:

| Parameter        | Value                                                                     |
| ---------------- | ------------------------------------------------------------------------- |
| `uri`            | `process.env.EXPO_PUBLIC_GRAPHQL_URL` (default: `http://localhost:8080/graphql`) |
| `cache`          | `InMemoryCache` with type policies for normalized entity caching          |
| `defaultOptions` | `fetchPolicy: 'cache-and-network'` for queries; network-only for mutations|

**Type policies (InMemoryCache):**

```
Member          → keyFields: ['id']
MemberSubscription → keyFields: ['id']
MembershipType  → keyFields: ['id']
Session         → keyFields: ['id']
SessionOccurrence → keyFields: ['id']
Trainer         → keyFields: ['id']
TrainerLog      → keyFields: ['id']
Payment         → keyFields: ['id']
PaymentDocument → keyFields: ['id']
```

### Code Generation

`graphql-codegen` is configured in `codegen.ts` at the project root. A `npm run codegen` script
regenerates `lib/gql/` whenever the schema or operation files change.

Directory layout:

```
lib/
├── apollo.ts              ApolloClient singleton
├── auth-context.tsx       AuthContext + AuthProvider
└── gql/
    ├── generated.ts       All generated types and hooks (output of codegen)
    └── operations/
        ├── members.graphql
        ├── subscriptions.graphql
        ├── membership-types.graphql
        ├── payments.graphql
        ├── sessions.graphql
        ├── trainers.graphql
        ├── trainer-logs.graphql
        └── chat.graphql
```

Every `.graphql` file defines named operations only (no anonymous queries). Operation naming
convention: `<Verb><Noun>` for mutations, `<Noun>` or `Get<Noun>` for queries.

### Operation Conventions

| Pattern                   | Rule                                                                      |
| ------------------------- | ------------------------------------------------------------------------- |
| Fragments                 | Define a `<Type>Fields` fragment per type; reuse across operations        |
| Pagination                | Phase 1 — no pagination; backend returns full lists. Add cursor pagination in Phase 2. |
| Optimistic updates        | Used only for status badge mutations (e.g. `changeMemberStatus`) to feel instant |
| Error policy              | `'all'` — always render partial data; display errors alongside results    |
| `createdAt`               | Always include in list queries for display; format with `date-fns`        |

---

## Domain Screens

### Chat (Ask Assistant)

**Route:** `(tabs)/chat.tsx`
**Audience:** All roles
**GraphQL:** `ask(input: AskInput!): AskResult!`

The chatbox is the flagship screen. It mirrors a standard messaging UI:

| Element               | Behaviour                                                                     |
| --------------------- | ----------------------------------------------------------------------------- |
| Message list          | Scrollable `FlatList`; user messages right-aligned, assistant messages left   |
| Input bar             | Text input + send button; disabled while query is in-flight                   |
| Loading indicator     | Animated typing indicator (three dots) while `useLazyQuery` is loading        |
| Tool call badges      | Once `ToolCallSummary` is wired in the backend, render a collapsible row of   |
|                       | tool names used to compose the answer                                         |
| Error state           | Inline error bubble with retry action                                         |
| Locale hint           | Auto-populated from device locale (`expo-localization`); not exposed in UI    |
| History               | Stored in component state for the session; cleared on tab unmount             |
| Empty state           | Prompt examples: "Who has unpaid dues?", "When is my next training session?"  |

**Accessibility:** the input has `accessibilityLabel="Type your question"` and the send button has
`accessibilityRole="button"`.

---

### Members

**Routes:** `(tabs)/members.tsx` (list) → `(admin)/members/[id].tsx` (detail) → `(admin)/members/new.tsx`
**Audience:** Admin only

#### Member List Screen

| Element           | Behaviour                                                                     |
| ----------------- | ----------------------------------------------------------------------------- |
| Search bar        | Filters list client-side by `firstName`, `lastName`, `email`                  |
| Status filter     | Segmented control: All / ACTIVE / INACTIVE / DELETED                          |
| List item         | Full name, email, status badge, `memberSince` date                            |
| FAB               | Navigates to `(admin)/members/new`                                            |
| Pull-to-refresh   | Refetches `members` query                                                      |
| Empty state       | Illustrated empty state with CTA to register first member                     |

**GraphQL:** `members(status: String): [Member!]!`

#### Member Detail Screen

| Section               | Fields / Actions                                                              |
| --------------------- | ----------------------------------------------------------------------------- |
| Header                | Full name, status badge, `memberSince` / `memberUntil`                        |
| Contact               | Email, phone number                                                           |
| Status history        | Expandable accordion; calls `memberStatusHistory(memberId)`                   |
| Actions               | Edit (→ edit form), Change Status (modal picker), GDPR Delete (destructive confirm dialog) |
| Subscriptions tab     | List of subscriptions; links to subscription detail                           |
| Payments tab          | Aggregated payments via `paymentsByMember(memberId)`                          |
| `createdAt`           | Shown in detail header as "Registered on …"                                   |

**Mutations used:** `updateMember`, `changeMemberStatus`, `deleteMember`

#### Register Member Screen

Form fields matching `CreateMemberInput`:
- `firstName` (required)
- `lastName` (required)
- `email` (required, email validation)
- `phoneNumber` (optional, E.164 hint)
- `memberSince` (date picker, default today, must not be in future)
- `memberUntil` (date picker, optional, must be after `memberSince`)

Submit calls `createMember(input: CreateMemberInput!)`. On success, navigate back to list and
invalidate `members` cache.

---

### Subscriptions & Payments

**Routes:** `(admin)/members/[id]/subscriptions.tsx`, `(member)/my-subscriptions.tsx`
**Audience:** Admin (all members), Member (own subscriptions only)

#### Subscription List

| Element            | Behaviour                                                                     |
| ------------------ | ----------------------------------------------------------------------------- |
| Active toggle      | Show all / active only                                                        |
| List item          | Membership type name, `startDate`–`endDate`, `paymentStatus` badge, price    |
| Add button         | Admin only; opens Subscribe Member form                                       |
| Swipe-to-end       | Admin only; triggers `endSubscription(id)` with confirm dialog                |

**GraphQL:** `memberSubscriptions(memberId, active)` / `mySubscriptions` (same query with own ID)

#### Subscribe Member Form

Fields matching `SubscribeMemberInput`:
- `membershipTypeId` (required; dropdown of ACTIVE membership types)
- `startDate` (required; date picker)
- `endDate` (optional; override auto-computed end)
- `agreedPrice` (optional; override type price; numeric input)

#### Payment List

| Element              | Behaviour                                                                    |
| -------------------- | ---------------------------------------------------------------------------- |
| Payment items        | Amount, currency, date, optional notes                                       |
| Payment status badge | NOT_PAID / IN_REVIEW / REVIEWED — color-coded per theme tokens               |
| Record Payment CTA   | Admin only; inline form: amount, currency (default EUR), date, notes        |
| Upload Document CTA  | Member + Admin; opens document picker (`expo-document-picker` PDF only)      |
| Pending review badge | Admin only; badge count for subscriptions in IN_REVIEW state                |

**Mutations:** `recordPayment`, `uploadPaymentDocument`, `reviewPaymentDocument`

---

### Membership Types

**Routes:** `(admin)/membership-types/index.tsx` (list) → `(admin)/membership-types/[id].tsx` (detail)
**Audience:** Admin only

#### Membership Type List

| Element       | Behaviour                                                                     |
| ------------- | ----------------------------------------------------------------------------- |
| Status filter | Segmented control: All / DRAFT / ACTIVE / INACTIVE                            |
| List item     | Name, price, duration + unit, status badge, session count                     |
| FAB           | Navigate to `new.tsx`                                                         |

#### Membership Type Detail

| Section           | Content                                                                       |
| ----------------- | ----------------------------------------------------------------------------- |
| Header            | Name, status badge, price, duration, proration flag, grace period             |
| Status actions    | Transition buttons rendered based on allowed transitions:                     |
|                   | DRAFT → "Launch" (→ ACTIVE), "Cancel" (→ INACTIVE)                           |
|                   | ACTIVE → "Discontinue" (→ INACTIVE)                                           |
|                   | INACTIVE → "Reactivate" (→ ACTIVE)                                            |
| Sessions          | Assigned session list; "Assign Session" button opens session picker modal;   |
|                   | "Remove" action per row calls `removeSessionFromMembership`                   |

**Mutations:** `createMembershipType`, `changeMembershipTypeStatus`, `assignSessionToMembership`, `removeSessionFromMembership`

---

### Sessions

**Routes:** `(tabs)/sessions.tsx` (list/calendar) → `(admin)/sessions/new.tsx` → `(admin)/sessions/[id]/occurrences.tsx`
**Audience:** Admin (full), Member (read + own upcoming)

#### Session List / Calendar

| Element           | Behaviour                                                                     |
| ----------------- | ----------------------------------------------------------------------------- |
| View toggle       | List view ↔ Weekly calendar strip                                             |
| Type filter       | All / TRAINING / FREE_GAME                                                    |
| List item         | Session name, day of week, time range, location, trainer (if TRAINING)        |
| Member view       | Shows only sessions accessible via active subscriptions (`sessionsByMember`)  |
| Next Session card | Pinned card at top: next SCHEDULED occurrence for the logged-in member         |

#### Session Detail / Occurrences

| Element             | Behaviour                                                                   |
| ------------------- | --------------------------------------------------------------------------- |
| Session info        | Name, type, schedule, location, assigned trainer                            |
| Occurrences list    | Date, status badge, notes; admin can cancel or mark complete                |
| Bulk create         | Date range picker + skip-dates selector; calls `createSessionOccurrences`   |
| Cancel occurrence   | Confirm dialog → `cancelSessionOccurrence(id)`                              |
| Complete occurrence | Confirm dialog → `completeSessionOccurrence(id)`                            |

#### Create Session Form

Fields matching `CreateSessionInput`:
- `name` (required)
- `sessionType` (picker: TRAINING / FREE_GAME)
- `dayOfWeek` (picker: Monday…Sunday)
- `startTime` / `endTime` (time pickers; end must be after start)
- `location` (required)
- `trainerId` (required if TRAINING; hidden if FREE_GAME; populated from `availableTrainers` query)

---

### Trainers

**Routes:** `(tabs)/trainers.tsx` (list) → `(admin)/trainers/[id].tsx` (detail) → `(admin)/trainers/new.tsx`
**Audience:** Admin (management), Trainer (own screens)

#### Trainer List

| Element      | Behaviour                                                                     |
| ------------ | ----------------------------------------------------------------------------- |
| List item    | Full name, email, payment mode badge, hourly rate                             |
| FAB          | Navigate to `new.tsx`                                                         |

#### Trainer Detail (Admin)

| Section            | Content                                                                      |
| ------------------ | ---------------------------------------------------------------------------- |
| Contact            | Name, email, phone; Edit button                                              |
| Settings           | Hourly rate, payment mode, auto-approve toggle; Edit Settings button         |
| Pending logs       | List of PENDING `TrainerLog` entries; Approve / Reject actions per row       |
| Payment summary    | Date range picker + summary card (approved hours × rate, total owed)         |

#### Register Trainer Form

Fields matching `CreateTrainerInput`:
- `firstName`, `lastName` (required)
- `email` (required)
- `phoneNumber` (optional)
- `hourlyRate` (required; numeric)
- `paymentMode` (picker: PER_SESSION / MONTHLY)
- `autoApproveHours` (toggle; default off)

#### Trainer — My Sessions (`(trainer)/my-sessions.tsx`)

Lists `sessions(sessionType: "TRAINING")` filtered to the logged-in trainer's `trainerId`.
Each session links to an occurrence list where the trainer can submit hours.

#### Trainer — Log Hours (`(trainer)/log-hours.tsx`)

| Field              | Behaviour                                                                    |
| ------------------ | ---------------------------------------------------------------------------- |
| Session occurrence | Picker of COMPLETED occurrences for the trainer's sessions                  |
| Hours worked       | Numeric input (max 2 decimal places)                                         |
| Notes              | Optional text area                                                           |
| Submit             | `submitTrainerHours` — auto-approved if `autoApproveHours = true`           |
| Resubmit           | Shown when previous log is REJECTED; calls `resubmitTrainerLog`             |

#### Trainer — My Earnings (`(trainer)/my-earnings.tsx`)

Date range pickers + summary card mirroring `TrainerPaymentSummary`:
- Approved hours, approved sessions, hourly rate, total owed
- Pending hours and pending sessions (grayed out)
- Payment mode badge

---

### Dashboard (Admin)

**Route:** `(tabs)/dashboard.tsx`
**Audience:** Admin only
**GraphQL:** `outstandingPayments`, `overdueSubscriptions`, `pendingPaymentReviews`, `pendingTrainerLogs`

| Widget                 | Data source             | Action                                           |
| ---------------------- | ----------------------- | ------------------------------------------------ |
| Outstanding payments   | `outstandingPayments`   | Tap row → member payments screen                 |
| Overdue subscriptions  | `overdueSubscriptions`  | Tap row → subscription detail; days-overdue badge|
| Pending reviews        | `pendingPaymentReviews` | Tap row → payment document review                |
| Pending trainer logs   | `pendingTrainerLogs`    | Tap row → approve/reject inline                  |

All four queries are fetched in parallel on mount. A global `refetch` button at the top refreshes all
four.

---

### Profile

**Route:** `(tabs)/profile.tsx`
**Audience:** All roles

| Element            | Behaviour                                                                    |
| ------------------ | ---------------------------------------------------------------------------- |
| Role badge         | Displays current role (ADMIN / MEMBER / TRAINER)                             |
| Identity           | For MEMBER: shows own `Member` data. For TRAINER: shows own `Trainer` data.  |
| Theme toggle       | Light / Dark / System                                                        |
| Switch role        | Phase 1: navigates to `(auth)/select-role` to change the mock role           |
| App version        | Reads from `expo-constants`                                                  |

---

## Shared UI Components

| Component           | Location                           | Description                                              |
| ------------------- | ---------------------------------- | -------------------------------------------------------- |
| `StatusBadge`       | `components/ui/status-badge.tsx`   | Colored pill for member/subscription/payment/log status  |
| `SectionCard`       | `components/ui/section-card.tsx`   | Card container with title, optional right-side action    |
| `FormField`         | `components/ui/form-field.tsx`     | Label + input + error text; wraps `TextInput`            |
| `DatePicker`        | `components/ui/date-picker.tsx`    | Cross-platform date selector (native on mobile, web-safe)|
| `TimePicker`        | `components/ui/time-picker.tsx`    | Cross-platform time selector                             |
| `ConfirmDialog`     | `components/ui/confirm-dialog.tsx` | Reusable destructive-action confirmation modal           |
| `EmptyState`        | `components/ui/empty-state.tsx`    | Illustration + message + optional CTA for empty lists    |
| `LoadingSkeleton`   | `components/ui/loading-skeleton.tsx`| Shimmer placeholder for list items during fetch          |
| `ErrorBanner`       | `components/ui/error-banner.tsx`   | Inline error with message and retry callback             |
| `ThemedText`        | `components/themed-text.tsx`       | Existing; extended with `variant` prop (body, heading…)  |
| `ThemedView`        | `components/themed-view.tsx`       | Existing; wraps views with background color from theme   |
| `ChatBubble`        | `components/ui/chat-bubble.tsx`    | Message bubble for the chat screen (user/assistant)      |
| `TypingIndicator`   | `components/ui/typing-indicator.tsx`| Animated 3-dot indicator for assistant in-flight state  |

---

## Error Handling & Loading States

| Scenario                    | UX pattern                                                               |
| --------------------------- | ------------------------------------------------------------------------ |
| Query loading (first fetch) | `LoadingSkeleton` overlaid on the list/card area                         |
| Query loading (refetch)     | `RefreshControl` spinner; stale data remains visible                     |
| Query error                 | `ErrorBanner` below the header with "Retry" button                       |
| Mutation in-flight          | Disable the submit button; show an `ActivityIndicator` inside the button |
| Mutation error              | Toast or inline error below the form                                     |
| Network offline             | `ErrorBanner` "No internet connection" pinned at the top of the screen   |
| GraphQL partial errors      | `errorPolicy: 'all'`; partial data rendered, errors surfaced via `ErrorBanner` |
| 403 / unauthorized          | Redirect to `(auth)/login` with message "Session expired"                |

---

## Offline & Connectivity

Phase 1 is online-only. The app does not queue mutations while offline.

- `@react-native-community/netinfo` monitors connectivity; when offline, the top-level layout renders
  a persistent `ErrorBanner` and disables all mutation CTAs.
- Apollo's `cache-and-network` fetch policy allows previously loaded list data to render instantly
  from cache on revisit.

---

## Accessibility

| Requirement                  | Implementation                                                           |
| ---------------------------- | ------------------------------------------------------------------------ |
| Screen reader labels         | All interactive elements have `accessibilityLabel`                       |
| Roles                        | Buttons use `accessibilityRole="button"`, lists use `accessibilityRole="list"` |
| Minimum tap target           | 44 × 44 dp minimum per Apple HIG / Material guidelines                   |
| Color contrast               | All color token pairs meet WCAG 2.1 AA (4.5:1 for normal text)           |
| Focus management             | After a modal closes, focus returns to the triggering element            |
| Dynamic type                 | `allowFontScaling` is not disabled on any `Text` component               |

---

## Rules & Edge Cases

### Members

1. A member with `memberUntil` in the past is shown with an "Expired" overlay badge even if their
   status is `ACTIVE`.
2. The GDPR Delete action must display a two-step confirmation: first warn the user, then require
   typing the member's email to confirm.
3. A `DELETED` member's name is replaced with "Anonymized" in all list views; the detail screen
   shows only the member ID and the deletion timestamp.
4. `changeMemberStatus` to `DELETED` is not available from the UI — GDPR deletion is the only path.
5. Editing a member with `currentStatus = DELETED` is not permitted; all edit actions are hidden.

### Membership Types

6. The "Launch" (DRAFT → ACTIVE) button is disabled if the membership type has no sessions assigned.
7. Transitioning to `DRAFT` from any other status is not shown in the UI (not a valid transition).
8. Price and duration fields are read-only once status is `ACTIVE` or `INACTIVE`.

### Sessions

9. The `trainerId` field is only shown when `sessionType = TRAINING`. When switching to
   `FREE_GAME`, the trainer selection is cleared.
10. A session occurrence cannot be cancelled or completed if it is already in a terminal status
    (`CANCELLED` or `COMPLETED`). The action buttons are hidden in those states.
11. Trainer hours can only be submitted against `COMPLETED` occurrences.

### Payments

12. `uploadPaymentDocument` accepts PDF files only; max 10 MB. Client-side validation before upload.
13. The document review action (`reviewPaymentDocument`) is Admin only and only available when
    `paymentStatus = IN_REVIEW`.
14. Once a subscription's `paymentStatus = REVIEWED`, the upload document CTA is hidden.

### Trainers

15. `rejectTrainerLog` requires a non-empty reason; the form validates this before submitting.
16. A `TrainerLog` in `APPROVED` status cannot be rejected or resubmitted — all actions are hidden.
17. `availableTrainers` is queried on the Create Session form using the selected `dayOfWeek`,
    `startTime`, and `endTime` to prevent double-booking.

### Chat

18. The chat input is limited to 1 000 characters. A character counter is shown below 100 characters
    remaining.
19. Each `AskResult` is rendered as Markdown (light — bold, italic, bullet lists, inline code). No
    HTML is rendered.
20. The chat session history is not persisted between app restarts in Phase 1.

---

## Architecture Notes

### Directory Structure

```
/
├── app/                     Expo Router file-system routes
├── assets/                  Static images and fonts
├── components/
│   └── ui/                  Primitive UI components
├── constants/
│   └── theme.ts             Design tokens (colors, spacing, typography)
├── docs/                    This specification and task files
├── hooks/                   Shared custom hooks
├── lib/
│   ├── apollo.ts            ApolloClient singleton
│   ├── auth-context.tsx     AuthContext + AuthProvider
│   └── gql/
│       ├── generated.ts     Codegen output — never edit manually
│       └── operations/      Named GraphQL operation files
├── scripts/                 Utility scripts
├── codegen.ts               graphql-codegen configuration
└── package.json
```

### Environment Variables

All runtime config is exposed via Expo's `EXPO_PUBLIC_` prefix (visible to the client bundle):

| Variable                      | Default                            | Description                        |
| ----------------------------- | ---------------------------------- | ---------------------------------- |
| `EXPO_PUBLIC_GRAPHQL_URL`     | `http://localhost:8080/graphql`    | Backend GraphQL endpoint           |
| `EXPO_PUBLIC_APP_ENV`         | `development`                      | `development` / `production`       |

**Important**: Never put secrets in `EXPO_PUBLIC_` variables — they are embedded in the JS bundle.

### Build Configuration

| Command              | Purpose                                                                   |
| -------------------- | ------------------------------------------------------------------------- |
| `npm run web`        | Start Expo dev server for web                                             |
| `npm run codegen`    | Regenerate GraphQL types and hooks from schema + operations               |
| `npm run lint`       | ESLint across `app/`, `components/`, `lib/`, `hooks/`                    |
| `expo build:web`     | Production web bundle (static export)                                     |

### Codegen Configuration (`codegen.ts`)

```ts
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: process.env.EXPO_PUBLIC_GRAPHQL_URL ?? 'http://localhost:8080/graphql',
  documents: ['lib/gql/operations/**/*.graphql'],
  generates: {
    'lib/gql/generated.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo',
      ],
      config: {
        withHooks: true,
        withComponent: false,
        withHOC: false,
        scalars: {
          Date: 'string',
          DateTime: 'string',
          LocalTime: 'string',
          BigDecimal: 'string',
          Long: 'number',
        },
      },
    },
  },
};

export default config;
```

### Scalar Mapping

| GraphQL Scalar | TypeScript type | Display format (via `date-fns`)         |
| -------------- | --------------- | --------------------------------------- |
| `Date`         | `string`        | `dd MMM yyyy` (e.g. "03 May 2026")      |
| `DateTime`     | `string`        | `dd MMM yyyy HH:mm` (e.g. "03 May 2026 14:30") |
| `LocalTime`    | `string`        | `HH:mm` (e.g. "09:00")                  |
| `BigDecimal`   | `string`        | `Intl.NumberFormat` with EUR currency   |
| `Long`         | `number`        | Raw number (used for file sizes: `x KB`)|

---

## Complexity Targets

| Area                         | Target                                                               |
| ---------------------------- | -------------------------------------------------------------------- |
| Initial page load (web)      | < 3 s on a 4G connection (Expo web bundle ≤ 500 KB gzipped)         |
| Time to interactive (chat)   | < 1 s from tab focus to input ready                                  |
| GraphQL round-trip (chat ask)| Dependent on LLM; show typing indicator for > 500 ms                |
| List render (100 members)    | No jank; `FlatList` with `getItemLayout` for fixed-height rows       |
| Form validation feedback     | Inline, < 16 ms after input blur (synchronous validation)            |
