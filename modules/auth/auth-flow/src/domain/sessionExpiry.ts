import type { Session } from './types';

// A token with less time left than this is renewed before using it, because
// a request that starts with seconds to spare can reach the server expired.
export const RENEWAL_MARGIN_MS = 60 * 1000;

export const shouldRenewAccessToken = (
  session: Session,
  now: number
): boolean => now >= session.accessTokenExpiresAt - RENEWAL_MARGIN_MS;
