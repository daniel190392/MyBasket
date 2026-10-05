import {
  authSessionReducer,
  initialAuthSessionState,
} from '../authSessionReducer';

import type { Session } from '../../domain/types';

const session: Session = {
  user: { id: '1', email: 'user@example.com', displayName: 'User' },
  accessToken: 'token',
};

describe('authSessionReducer', () => {
  it('starts restoring', () => {
    expect(initialAuthSessionState).toEqual({ status: 'restoring' });
  });

  it('signs in when a stored session is restored', () => {
    expect(
      authSessionReducer(initialAuthSessionState, { type: 'restored', session })
    ).toEqual({ status: 'signedIn', session });
  });

  it('is signed out when nothing is restored', () => {
    expect(
      authSessionReducer(initialAuthSessionState, {
        type: 'restored',
        session: null,
      })
    ).toEqual({ status: 'signedOut' });
  });

  it('signs in', () => {
    expect(
      authSessionReducer({ status: 'signedOut' }, { type: 'signedIn', session })
    ).toEqual({ status: 'signedIn', session });
  });

  it('signs out', () => {
    expect(
      authSessionReducer({ status: 'signedIn', session }, { type: 'signedOut' })
    ).toEqual({ status: 'signedOut' });
  });
});
