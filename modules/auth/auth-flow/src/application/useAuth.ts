import { useContext } from 'react';

import { AuthContext } from './AuthSessionProvider';

import type { AuthContextValue } from './AuthSessionProvider';

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthSessionProvider');
  }
  return context;
};
