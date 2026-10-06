import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from 'react';

import {
  authSessionReducer,
  initialAuthSessionState,
} from './authSessionReducer';

import type { ReactNode } from 'react';
import type { AuthService } from './AuthService';
import type { AuthSessionState } from './authSessionReducer';
import type { Credentials, Registration } from '../domain/types';

export type AuthContextValue = AuthSessionState & {
  signIn: (credentials: Credentials) => Promise<void>;
  signUp: (registration: Registration) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export type AuthSessionProviderProps = {
  service: AuthService;
  children: ReactNode;
};

export function AuthSessionProvider({
  service,
  children,
}: AuthSessionProviderProps) {
  const [state, dispatch] = useReducer(
    authSessionReducer,
    initialAuthSessionState
  );

  useEffect(() => {
    let isActive = true;
    service.restoreSession().then((session) => {
      if (isActive) dispatch({ type: 'restored', session });
    });
    return () => {
      isActive = false;
    };
  }, [service]);

  const signIn = useCallback(
    async (credentials: Credentials) => {
      const session = await service.signIn(credentials);
      dispatch({ type: 'signedIn', session });
    },
    [service]
  );

  const signUp = useCallback(
    async (registration: Registration) => {
      const session = await service.signUp(registration);
      dispatch({ type: 'signedIn', session });
    },
    [service]
  );

  const signOut = useCallback(async () => {
    if (state.status !== 'signedIn') return;
    try {
      await service.signOut(state.session);
    } finally {
      dispatch({ type: 'signedOut' });
    }
  }, [service, state]);

  const value = useMemo(
    () => ({ ...state, signIn, signUp, signOut }),
    [state, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
