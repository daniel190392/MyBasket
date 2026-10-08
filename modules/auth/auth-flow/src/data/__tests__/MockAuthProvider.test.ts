import { isAuthError } from '../../domain/errors';
import { DEFAULT_MOCK_USERS, MockAuthProvider } from '../MockAuthProvider';

const [demoUser] = DEFAULT_MOCK_USERS;
const NO_LATENCY = { latencyMs: 0 };

describe('MockAuthProvider', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('signs in a known user', async () => {
    const provider = new MockAuthProvider(NO_LATENCY);

    const session = await provider.signIn({
      email: demoUser.email,
      password: demoUser.password,
    });

    expect(session.user.displayName).toBe(demoUser.displayName);
    expect(session.accessToken).toBeTruthy();
  });

  it('matches the email ignoring case and surrounding spaces', async () => {
    const provider = new MockAuthProvider(NO_LATENCY);

    const session = await provider.signIn({
      email: `  ${demoUser.email.toUpperCase()} `,
      password: demoUser.password,
    });

    expect(session.user.email).toBe(demoUser.email);
  });

  it('rejects a wrong password with invalid-credentials', async () => {
    const provider = new MockAuthProvider(NO_LATENCY);

    const attempt = provider.signIn({
      email: demoUser.email,
      password: 'wrong-password',
    });

    await expect(attempt).rejects.toMatchObject({
      code: 'invalid-credentials',
    });
  });

  it('signs up a new user who can then sign in', async () => {
    const provider = new MockAuthProvider(NO_LATENCY);
    const registration = {
      email: 'new@mybasket.test',
      password: 'new-password',
      displayName: 'New User',
    };

    const result = await provider.signUp(registration);
    const nextSession = await provider.signIn({
      email: registration.email,
      password: registration.password,
    });

    expect(result).toEqual({ status: 'signedIn', session: nextSession });
    expect(nextSession.user.displayName).toBe(registration.displayName);
  });

  it('rejects a sign up with an email already in use', async () => {
    const provider = new MockAuthProvider(NO_LATENCY);

    const attempt = provider.signUp({
      email: `  ${demoUser.email.toUpperCase()} `,
      password: 'another-password',
      displayName: 'Impostor',
    });

    await expect(attempt).rejects.toMatchObject({
      code: 'email-already-in-use',
    });
  });

  it('does not share registered users between instances', async () => {
    const registration = {
      email: 'new@mybasket.test',
      password: 'new-password',
      displayName: 'New User',
    };
    await new MockAuthProvider(NO_LATENCY).signUp(registration);

    await expect(
      new MockAuthProvider(NO_LATENCY).signUp(registration)
    ).resolves.toBeDefined();
  });

  it('fails every call with the forced error code', async () => {
    const provider = new MockAuthProvider({
      ...NO_LATENCY,
      failWith: 'network',
    });

    const error = await provider
      .signIn({ email: demoUser.email, password: demoUser.password })
      .catch((caught: unknown) => caught);

    expect(isAuthError(error)).toBe(true);
    expect(error).toMatchObject({ code: 'network' });
  });

  it('uses the configured users', async () => {
    const provider = new MockAuthProvider({
      ...NO_LATENCY,
      users: [{ email: 'a@b.test', password: 'pw', displayName: 'Ada' }],
    });

    const session = await provider.signIn({
      email: 'a@b.test',
      password: 'pw',
    });

    expect(session.user.displayName).toBe('Ada');
  });

  it('waits the configured latency before answering', async () => {
    jest.useFakeTimers();
    const provider = new MockAuthProvider({ latencyMs: 500 });
    const onSettled = jest.fn();

    provider
      .signIn({ email: demoUser.email, password: demoUser.password })
      .then(onSettled);
    await jest.advanceTimersByTimeAsync(499);
    expect(onSettled).not.toHaveBeenCalled();

    await jest.advanceTimersByTimeAsync(1);
    expect(onSettled).toHaveBeenCalledTimes(1);
  });
});

describe('MockAuthProvider password recovery', () => {
  it('resolves for a known email', async () => {
    const provider = new MockAuthProvider(NO_LATENCY);

    await expect(
      provider.requestPasswordRecovery(demoUser.email)
    ).resolves.toBeUndefined();
  });

  it('resolves for an unknown email so accounts are not revealed', async () => {
    const provider = new MockAuthProvider(NO_LATENCY);

    await expect(
      provider.requestPasswordRecovery('unknown@mybasket.test')
    ).resolves.toBeUndefined();
  });

  it('fails with the forced error code', async () => {
    const provider = new MockAuthProvider({
      ...NO_LATENCY,
      failWith: 'network',
    });

    await expect(
      provider.requestPasswordRecovery(demoUser.email)
    ).rejects.toMatchObject({ code: 'network' });
  });
});
