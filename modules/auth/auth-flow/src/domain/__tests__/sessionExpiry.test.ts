import { RENEWAL_MARGIN_MS, shouldRenewAccessToken } from '../sessionExpiry';

import type { Session } from '../types';

const EXPIRES_AT = 1_000_000;
const RENEWAL_STARTS_AT = EXPIRES_AT - RENEWAL_MARGIN_MS;

const session: Session = {
  user: { id: 'user-1', email: 'ana@example.com', displayName: 'Ana' },
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  accessTokenExpiresAt: EXPIRES_AT,
};

describe('shouldRenewAccessToken', () => {
  it('does not renew while more than the margin is left', () => {
    expect(shouldRenewAccessToken(session, RENEWAL_STARTS_AT - 1)).toBe(false);
  });

  it('renews when exactly the margin is left', () => {
    expect(shouldRenewAccessToken(session, RENEWAL_STARTS_AT)).toBe(true);
  });

  it('renews when less than the margin is left', () => {
    expect(shouldRenewAccessToken(session, EXPIRES_AT - 1)).toBe(true);
  });

  it('renews once the access token has expired', () => {
    expect(shouldRenewAccessToken(session, EXPIRES_AT + 1)).toBe(true);
  });
});
