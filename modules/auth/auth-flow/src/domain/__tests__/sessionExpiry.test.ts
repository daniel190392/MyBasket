import { isAccessTokenExpired } from '../sessionExpiry';

import type { Session } from '../types';

const EXPIRES_AT = 1_000_000;

const session: Session = {
  user: { id: 'user-1', email: 'ana@example.com', displayName: 'Ana' },
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  accessTokenExpiresAt: EXPIRES_AT,
};

describe('isAccessTokenExpired', () => {
  it('is not expired before the expiry instant', () => {
    expect(isAccessTokenExpired(session, EXPIRES_AT - 1)).toBe(false);
  });

  it('is expired at the expiry instant', () => {
    expect(isAccessTokenExpired(session, EXPIRES_AT)).toBe(true);
  });

  it('is expired after the expiry instant', () => {
    expect(isAccessTokenExpired(session, EXPIRES_AT + 1)).toBe(true);
  });
});
