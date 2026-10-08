import { AuthError } from '../domain/errors';

import type { AuthErrorCode } from '../domain/errors';
import type { AuthProvider } from '../domain/AuthProvider';
import type {
  Credentials,
  Registration,
  Session,
  SignUpResult,
} from '../domain/types';

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
    // Copied so sign ups never leak into the shared default users list.
    this.users = [...users];
    this.latencyMs = latencyMs;
    this.failWith = failWith;
  }

  async signIn({ email, password }: Credentials): Promise<Session> {
    await this.simulateRequest();

    const userIndex = this.users.findIndex(
      (user) =>
        normalizeEmail(user.email) === normalizeEmail(email) &&
        user.password === password
    );
    if (userIndex === -1) {
      throw new AuthError('invalid-credentials');
    }

    return this.createSession(userIndex);
  }

  async signUp({
    email,
    password,
    displayName,
  }: Registration): Promise<SignUpResult> {
    await this.simulateRequest();

    const isEmailTaken = this.users.some(
      (user) => normalizeEmail(user.email) === normalizeEmail(email)
    );
    if (isEmailTaken) {
      throw new AuthError('email-already-in-use');
    }

    this.users.push({ email: email.trim(), password, displayName });
    return {
      status: 'signedIn',
      session: this.createSession(this.users.length - 1),
    };
  }

  async signOut(): Promise<void> {
    await wait(this.latencyMs);
  }

  // Resolves the same way for unknown emails so the response never reveals
  // which accounts exist.
  async requestPasswordRecovery(_email: string): Promise<void> {
    await this.simulateRequest();
  }

  private async simulateRequest(): Promise<void> {
    await wait(this.latencyMs);

    if (this.failWith) {
      throw new AuthError(this.failWith);
    }
  }

  private createSession(userIndex: number): Session {
    const { email, displayName } = this.users[userIndex];
    return {
      user: { id: `mock-user-${userIndex}`, email, displayName },
      accessToken: `mock-access-token-${userIndex}`,
    };
  }
}
