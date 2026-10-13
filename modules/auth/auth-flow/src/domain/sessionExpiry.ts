import type { Session } from './types';

export const isAccessTokenExpired = (session: Session, now: number): boolean =>
  now >= session.accessTokenExpiresAt;
