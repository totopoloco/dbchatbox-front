import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useReducer } from 'react';

import type { KnownRole } from './jwt';

export type Role = KnownRole;

export interface Session {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  /** epoch ms */
  expiresAt: number;
  tenantSlug: string;
  role: Role;
  username: string;
  email: string | null;
  memberId: string | null;
  trainerId: string | null;
}

const STORAGE_KEY = '@watsimmering/session';

// Read synchronously by the Apollo auth link on every request. Kept outside React
// state because the ApolloClient singleton is created before AuthProvider mounts.
let currentAccessToken: string | null = null;

export function getAccessToken(): string | null {
  return currentAccessToken;
}

/** Set right after the login mutation resolves, before the session is fully assembled. */
export function setAccessToken(token: string | null): void {
  currentAccessToken = token;
}

type AuthAction =
  | { type: 'HYDRATE'; session: Session | null }
  | { type: 'SIGN_IN'; session: Session }
  | { type: 'SIGN_OUT' };

interface AuthState {
  session: Session | null;
  isReady: boolean;
}

const initialState: AuthState = { session: null, isReady: false };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'HYDRATE':
      return { session: action.session, isReady: true };
    case 'SIGN_IN':
      return { session: action.session, isReady: true };
    case 'SIGN_OUT':
      return { session: null, isReady: true };
    default:
      return state;
  }
}

interface AuthContextValue {
  session: Session | null;
  isReady: boolean;
  signIn: (session: Session) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        if (!raw) {
          dispatch({ type: 'HYDRATE', session: null });
          return;
        }
        const session = JSON.parse(raw) as Session;
        if (session.expiresAt <= Date.now()) {
          AsyncStorage.removeItem(STORAGE_KEY).catch(() => undefined);
          dispatch({ type: 'HYDRATE', session: null });
          return;
        }
        currentAccessToken = session.accessToken;
        dispatch({ type: 'HYDRATE', session });
      })
      .catch(() => dispatch({ type: 'HYDRATE', session: null }));
  }, []);

  const signIn = async (session: Session) => {
    currentAccessToken = session.accessToken;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    dispatch({ type: 'SIGN_IN', session });
  };

  const signOut = async () => {
    currentAccessToken = null;
    await AsyncStorage.removeItem(STORAGE_KEY);
    dispatch({ type: 'SIGN_OUT' });
  };

  return (
    <AuthContext.Provider value={{ session: state.session, isReady: state.isReady, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
