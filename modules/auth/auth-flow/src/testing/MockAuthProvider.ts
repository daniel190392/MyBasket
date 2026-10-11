import { AuthError } from '../domain/errors';
import { isStrongPassword } from '../domain/validation';

import type { AuthErrorCode } from '../domain/errors';
import type { AuthProvider } from '../domain/AuthProvider';
import type {
  Credentials,
  PasswordRecoveryConfirmation,
  Registration,
  Session,
  SignUpConfirmation,
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
  /** Makes sign up return `confirmationRequired`, like the real backend. */
  requireConfirmation?: boolean;
};

export const DEFAULT_MOCK_LATENCY_MS = 600;
export const MOCK_CONFIRMATION_CODE = '123456';
export const MOCK_EXPIRED_CONFIRMATION_CODE = '000000';

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
  private readonly requireConfirmation: boolean;
  private readonly pendingUsers: MockUser[] = [];

  constructor({
    users = DEFAULT_MOCK_USERS,
    latencyMs = DEFAULT_MOCK_LATENCY_MS,
    failWith,
    requireConfirmation = false,
  }: MockAuthProviderOptions = {}) {
    // Copied so sign ups never leak into the shared default users list.
    this.users = [...users];
    this.latencyMs = latencyMs;
    this.failWith = failWith;
    this.requireConfirmation = requireConfirmation;
  }

  async signIn({ email, password }: Credentials): Promise<Session> {
    await this.simulateRequest();

    const userIndex = this.users.findIndex(
      (user) =>
        normalizeEmail(user.email) === normalizeEmail(email) &&
        user.password === password
    );
    if (userIndex === -1) {
      // Like the real backend, only the right password reveals the account
      // is waiting for its confirmation.
      const isUnconfirmed = this.pendingUsers.some(
        (user) =>
          normalizeEmail(user.email) === normalizeEmail(email) &&
          user.password === password
      );
      throw new AuthError(
        isUnconfirmed ? 'user-not-confirmed' : 'invalid-credentials'
      );
    }

    return this.createSession(userIndex);
  }

  async signUp({
    email,
    password,
    displayName,
  }: Registration): Promise<SignUpResult> {
    await this.simulateRequest();

    if (!isStrongPassword(password)) {
      throw new AuthError('weak-password');
    }

    const isEmailTaken = [...this.users, ...this.pendingUsers].some(
      (user) => normalizeEmail(user.email) === normalizeEmail(email)
    );
    if (isEmailTaken) {
      throw new AuthError('email-already-in-use');
    }

    const newUser = { email: email.trim(), password, displayName };
    if (this.requireConfirmation) {
      this.pendingUsers.push(newUser);
      return { status: 'confirmationRequired', email: newUser.email };
    }

    this.users.push(newUser);
    return {
      status: 'signedIn',
      session: this.createSession(this.users.length - 1),
    };
  }

  async confirmSignUp({ email, code }: SignUpConfirmation): Promise<void> {
    await this.simulateRequest();
    this.assertValidCode(code);

    const pendingIndex = this.pendingUsers.findIndex(
      (user) => normalizeEmail(user.email) === normalizeEmail(email)
    );
    if (pendingIndex !== -1) {
      const [confirmedUser] = this.pendingUsers.splice(pendingIndex, 1);
      this.users.push(confirmedUser);
    }
  }

  // Resolves for any email so the response never reveals which accounts exist.
  async resendConfirmationCode(_email: string): Promise<void> {
    await this.simulateRequest();
  }

  async signOut(): Promise<void> {
    await wait(this.latencyMs);
  }

  // Resolves the same way for unknown emails so the response never reveals
  // which accounts exist.
  async requestPasswordRecovery(_email: string): Promise<void> {
    await this.simulateRequest();
  }

  async confirmPasswordRecovery({
    email,
    code,
    newPassword,
  }: PasswordRecoveryConfirmation): Promise<void> {
    await this.simulateRequest();
    this.assertValidCode(code);

    const userIndex = this.users.findIndex(
      (user) => normalizeEmail(user.email) === normalizeEmail(email)
    );
    if (userIndex === -1) {
      // The real backend reports an unknown email as a wrong code, so the
      // response does not reveal which accounts exist.
      throw new AuthError('invalid-code');
    }

    if (!isStrongPassword(newPassword)) {
      throw new AuthError('weak-password');
    }

    // Replaced, not mutated: the user objects may be shared with the defaults.
    this.users[userIndex] = {
      ...this.users[userIndex],
      password: newPassword,
    };
  }

  private assertValidCode(code: string): void {
    if (code === MOCK_EXPIRED_CONFIRMATION_CODE) {
      throw new AuthError('expired-code');
    }
    if (code !== MOCK_CONFIRMATION_CODE) {
      throw new AuthError('invalid-code');
    }
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
