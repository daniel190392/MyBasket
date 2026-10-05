import type { Session } from '../domain/types';

export type AuthSessionState =
  | { status: 'restoring' }
  | { status: 'signedOut' }
  | { status: 'signedIn'; session: Session };

export type AuthSessionAction =
  | { type: 'restored'; session: Session | null }
  | { type: 'signedIn'; session: Session }
  | { type: 'signedOut' };

export const initialAuthSessionState: AuthSessionState = {
  status: 'restoring',
};

export const authSessionReducer = (
  state: AuthSessionState,
  action: AuthSessionAction
): AuthSessionState => {
  switch (action.type) {
    case 'restored':
      return action.session
        ? { status: 'signedIn', session: action.session }
        : { status: 'signedOut' };
    case 'signedIn':
      return { status: 'signedIn', session: action.session };
    case 'signedOut':
      return { status: 'signedOut' };
    default:
      return state;
  }
};
