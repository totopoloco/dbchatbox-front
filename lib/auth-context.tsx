import React, { createContext, useContext, useReducer } from 'react';

export type Role = 'admin' | 'member' | 'trainer';

export interface AuthState {
  role: Role | null;
  memberId: string | null;
  trainerId: string | null;
}

type AuthAction =
  | { type: 'SIGN_IN'; role: Role; memberId?: string; trainerId?: string }
  | { type: 'SIGN_OUT' };

const initialState: AuthState = {
  role: null,
  memberId: null,
  trainerId: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SIGN_IN':
      return {
        role: action.role,
        memberId: action.memberId ?? null,
        trainerId: action.trainerId ?? null,
      };
    case 'SIGN_OUT':
      return initialState;
    default:
      return state;
  }
}

interface AuthContextValue {
  auth: AuthState;
  signIn: (role: Role, memberId?: string, trainerId?: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, dispatch] = useReducer(authReducer, initialState);

  const signIn = (role: Role, memberId?: string, trainerId?: string) => {
    dispatch({ type: 'SIGN_IN', role, memberId, trainerId });
  };

  const signOut = () => {
    dispatch({ type: 'SIGN_OUT' });
  };

  return (
    <AuthContext.Provider value={{ auth, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
