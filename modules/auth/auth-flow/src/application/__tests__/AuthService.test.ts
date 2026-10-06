import { InMemorySessionStorage } from '../../data/InMemorySessionStorage';
import {
  DEFAULT_MOCK_USERS,
  MockAuthProvider,
} from '../../data/MockAuthProvider';
import { AuthError } from '../../domain/errors';
import { AuthService } from '../AuthService';

import type { AuthProvider } from '../../domain/AuthProvider';
import type { SessionStorage } from '../../domain/SessionStorage';
import type { Session } from '../../domain/types';

const [demoUser] = DEFAULT_MOCK_USERS;
const credentials = { email: demoUser.email, password: demoUser.password };

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

    const session = await service.signUp({
      email: 'new@mybasket.test',
      password: 'new-password',
      displayName: 'New User',
    });

    expect(await sessionStorage.load()).toEqual(session);
  });

  it('does not persist anything when the sign up is rejected', async () => {
    const { service, sessionStorage } = createService();

    await expect(
      service.signUp({ ...credentials, displayName: 'Taken' })
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
      requestPasswordRecovery: jest.fn(),
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
