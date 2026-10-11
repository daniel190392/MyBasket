import { InMemorySessionStorage } from '../../testing/InMemorySessionStorage';
import {
  DEFAULT_MOCK_USERS,
  MOCK_CONFIRMATION_CODE,
  MockAuthProvider,
} from '../../testing/MockAuthProvider';
import { AuthError } from '../../domain/errors';
import { AuthService } from '../AuthService';

import type { AuthProvider } from '../../domain/AuthProvider';
import type { SessionStorage } from '../../domain/SessionStorage';
import type { Session } from '../../domain/types';

const [demoUser] = DEFAULT_MOCK_USERS;
const credentials = { email: demoUser.email, password: demoUser.password };
// Meets the password policy, which the mock enforces like the real backend.
const STRONG_PASSWORD = 'Newpass1';

const createService = (provider?: AuthProvider, storage?: SessionStorage) => {
  const sessionStorage = storage ?? new InMemorySessionStorage();
  const authProvider = provider ?? new MockAuthProvider({ latencyMs: 0 });
  return {
    service: new AuthService(authProvider, sessionStorage),
    sessionStorage,
  };
};

describe('AuthService', () => {
  it('persists the session after a successful sign in', async () => {
    const { service, sessionStorage } = createService();

    const session = await service.signIn(credentials);

    expect(await sessionStorage.load()).toEqual(session);
  });

  it('does not persist anything when the provider rejects', async () => {
    const { service, sessionStorage } = createService();

    await expect(
      service.signIn({ ...credentials, password: 'wrong' })
    ).rejects.toBeInstanceOf(AuthError);

    expect(await sessionStorage.load()).toBeNull();
  });

  it('persists the session after a successful sign up', async () => {
    const { service, sessionStorage } = createService();

    const result = await service.signUp({
      email: 'new@mybasket.test',
      password: STRONG_PASSWORD,
      displayName: 'New User',
    });

    expect(result.status).toBe('signedIn');
    expect(await sessionStorage.load()).toEqual(
      result.status === 'signedIn' ? result.session : undefined
    );
  });

  it('does not persist anything when the sign up needs confirmation', async () => {
    const provider: AuthProvider = {
      signIn: jest.fn(),
      signUp: jest.fn().mockResolvedValue({
        status: 'confirmationRequired',
        email: 'new@mybasket.test',
      }),
      signOut: jest.fn(),
      confirmSignUp: jest.fn(),
      resendConfirmationCode: jest.fn(),
      requestPasswordRecovery: jest.fn(),
      confirmPasswordRecovery: jest.fn(),
    };
    const { service, sessionStorage } = createService(provider);

    const result = await service.signUp({
      email: 'new@mybasket.test',
      password: 'new-password',
      displayName: 'New User',
    });

    expect(result).toEqual({
      status: 'confirmationRequired',
      email: 'new@mybasket.test',
    });
    expect(await sessionStorage.load()).toBeNull();
  });

  it('does not persist anything when the sign up is rejected', async () => {
    const { service, sessionStorage } = createService();

    await expect(
      service.signUp({
        ...credentials,
        password: STRONG_PASSWORD,
        displayName: 'Taken',
      })
    ).rejects.toMatchObject({ code: 'email-already-in-use' });

    expect(await sessionStorage.load()).toBeNull();
  });

  it('restores the stored session', async () => {
    const { service } = createService();
    const session = await service.signIn(credentials);

    expect(await service.restoreSession()).toEqual(session);
  });

  it('restores null when there is no stored session', async () => {
    const { service } = createService();

    expect(await service.restoreSession()).toBeNull();
  });

  it('recovers from an unreadable storage by clearing it', async () => {
    const clear = jest.fn().mockResolvedValue(undefined);
    const brokenStorage: SessionStorage = {
      load: jest.fn().mockRejectedValue(new Error('corrupted')),
      save: jest.fn(),
      clear,
    };
    const { service } = createService(undefined, brokenStorage);

    expect(await service.restoreSession()).toBeNull();
    expect(clear).toHaveBeenCalledTimes(1);
  });

  it('clears the stored session on sign out', async () => {
    const { service, sessionStorage } = createService();
    const session = await service.signIn(credentials);

    await service.signOut(session);

    expect(await sessionStorage.load()).toBeNull();
  });

  it('clears the stored session even when the provider fails on sign out', async () => {
    const failingProvider: AuthProvider = {
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn().mockRejectedValue(new AuthError('network')),
      confirmSignUp: jest.fn(),
      resendConfirmationCode: jest.fn(),
      requestPasswordRecovery: jest.fn(),
      confirmPasswordRecovery: jest.fn(),
    };
    const { service, sessionStorage } = createService(failingProvider);
    const session: Session = {
      user: { id: '1', email: demoUser.email, displayName: 'Demo' },
      accessToken: 'token',
    };
    await sessionStorage.save(session);

    await expect(service.signOut(session)).rejects.toMatchObject({
      code: 'network',
    });

    expect(await sessionStorage.load()).toBeNull();
  });
});

describe('AuthService password recovery', () => {
  it('delegates the request to the provider without creating a session', async () => {
    const provider = new MockAuthProvider({ latencyMs: 0 });
    const requestPasswordRecovery = jest.spyOn(
      provider,
      'requestPasswordRecovery'
    );
    const { service, sessionStorage } = createService(provider);

    await service.requestPasswordRecovery(demoUser.email);

    expect(requestPasswordRecovery).toHaveBeenCalledWith(demoUser.email);
    expect(await sessionStorage.load()).toBeNull();
  });

  it('propagates the provider error', async () => {
    const provider = new MockAuthProvider({
      latencyMs: 0,
      failWith: 'network',
    });
    const { service } = createService(provider);

    await expect(
      service.requestPasswordRecovery(demoUser.email)
    ).rejects.toBeInstanceOf(AuthError);
  });
});

describe('AuthService sign up confirmation', () => {
  it('delegates the confirmation without creating a session', async () => {
    const provider = new MockAuthProvider({ latencyMs: 0 });
    const confirmSignUp = jest.spyOn(provider, 'confirmSignUp');
    const { service, sessionStorage } = createService(provider);
    const confirmation = {
      email: 'new@mybasket.test',
      code: MOCK_CONFIRMATION_CODE,
    };

    await service.confirmSignUp(confirmation);

    expect(confirmSignUp).toHaveBeenCalledWith(confirmation);
    expect(await sessionStorage.load()).toBeNull();
  });

  it('propagates the error of a wrong code', async () => {
    const { service } = createService();

    await expect(
      service.confirmSignUp({ email: 'new@mybasket.test', code: '999999' })
    ).rejects.toMatchObject({ code: 'invalid-code' });
  });

  it('delegates the resend to the provider', async () => {
    const provider = new MockAuthProvider({ latencyMs: 0 });
    const resendConfirmationCode = jest.spyOn(
      provider,
      'resendConfirmationCode'
    );
    const { service } = createService(provider);

    await service.resendConfirmationCode('new@mybasket.test');

    expect(resendConfirmationCode).toHaveBeenCalledWith('new@mybasket.test');
  });
});

describe('AuthService password recovery confirmation', () => {
  it('delegates the confirmation without creating a session', async () => {
    const provider = new MockAuthProvider({ latencyMs: 0 });
    const confirmPasswordRecovery = jest.spyOn(
      provider,
      'confirmPasswordRecovery'
    );
    const { service, sessionStorage } = createService(provider);
    const confirmation = {
      email: demoUser.email,
      code: MOCK_CONFIRMATION_CODE,
      newPassword: 'New-password-1',
    };

    await service.confirmPasswordRecovery(confirmation);

    expect(confirmPasswordRecovery).toHaveBeenCalledWith(confirmation);
    expect(await sessionStorage.load()).toBeNull();
  });

  it('propagates the error of a wrong code', async () => {
    const { service } = createService();

    await expect(
      service.confirmPasswordRecovery({
        email: demoUser.email,
        code: '999999',
        newPassword: 'New-password-1',
      })
    ).rejects.toMatchObject({ code: 'invalid-code' });
  });
});
