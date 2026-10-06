import { AuthError } from '../domain/errors';

import type { AuthErrorCode } from '../domain/errors';
import type { AuthProvider } from '../domain/AuthProvider';
import type { Credentials, Session } from '../domain/types';

export type MockUser = {
  email: string;
  password: string;
  displayName: string;
};

export type MockAuthProviderOptions = {
  users?: MockUser[];
  latencyMs?: number;
  /** Makes every call fail with this code, to exercise error states. */
  failWith?: AuthErrorCode;
};

export const DEFAULT_MOCK_LATENCY_MS = 600;

export const DEFAULT_MOCK_USERS: MockUser[] = [
  {
    email: 'demo@mybasket.test',
    password: 'demo-password',
    displayName: 'Demo User',
  },
];

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export class MockAuthProvider implements AuthProvider {
  private readonly users: MockUser[];
  private readonly latencyMs: number;
  private readonly failWith?: AuthErrorCode;

  constructor({
    users = DEFAULT_MOCK_USERS,
    latencyMs = DEFAULT_MOCK_LATENCY_MS,
    failWith,
  }: MockAuthProviderOptions = {}) {
    this.users = users;
    this.latencyMs = latencyMs;
    this.failWith = failWith;
  }

  async signIn({ email, password }: Credentials): Promise<Session> {
    await wait(this.latencyMs);

    if (this.failWith) {
      throw new AuthError(this.failWith);
    }

    const userIndex = this.users.findIndex(
      (user) =>
        normalizeEmail(user.email) === normalizeEmail(email) &&
        user.password === password
    );
    if (userIndex === -1) {
      throw new AuthError('invalid-credentials');
    }

    const { email: userEmail, displayName } = this.users[userIndex];
    return {
      user: { id: `mock-user-${userIndex}`, email: userEmail, displayName },
      accessToken: `mock-access-token-${userIndex}`,
    };
  }

  async signOut(): Promise<void> {
    await wait(this.latencyMs);
  }
}
