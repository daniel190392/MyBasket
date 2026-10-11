import { isAuthError } from '../../domain/errors';
import {
  DEFAULT_MOCK_USERS,
  MOCK_CONFIRMATION_CODE,
  MOCK_EXPIRED_CONFIRMATION_CODE,
  MockAuthProvider,
} from '../MockAuthProvider';

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

describe('MockAuthProvider password recovery confirmation', () => {
  const NEW_PASSWORD = 'New-password-1';

  it('lets the user sign in with the new password only', async () => {
    const provider = new MockAuthProvider(NO_LATENCY);

    await provider.confirmPasswordRecovery({
      email: demoUser.email,
      code: MOCK_CONFIRMATION_CODE,
      newPassword: NEW_PASSWORD,
    });

    await expect(
      provider.signIn({ email: demoUser.email, password: NEW_PASSWORD })
    ).resolves.toMatchObject({ user: { email: demoUser.email } });
    await expect(
      provider.signIn({ email: demoUser.email, password: demoUser.password })
    ).rejects.toMatchObject({ code: 'invalid-credentials' });
  });

  it('does not change the shared default users', async () => {
    const provider = new MockAuthProvider(NO_LATENCY);

    await provider.confirmPasswordRecovery({
      email: demoUser.email,
      code: MOCK_CONFIRMATION_CODE,
      newPassword: NEW_PASSWORD,
    });

    expect(demoUser.password).not.toBe(NEW_PASSWORD);
  });

  it('resolves for an unknown email so accounts are not revealed', async () => {
    const provider = new MockAuthProvider(NO_LATENCY);

    await expect(
      provider.confirmPasswordRecovery({
        email: 'unknown@mybasket.test',
        code: MOCK_CONFIRMATION_CODE,
        newPassword: NEW_PASSWORD,
      })
    ).resolves.toBeUndefined();
  });

  it.each([
    ['999999', 'invalid-code'],
    [MOCK_EXPIRED_CONFIRMATION_CODE, 'expired-code'],
  ])('rejects the code %s with %s', async (code, expectedCode) => {
    const provider = new MockAuthProvider(NO_LATENCY);

    const error = await provider
      .confirmPasswordRecovery({
        email: demoUser.email,
        code,
        newPassword: NEW_PASSWORD,
      })
      .catch((caught) => caught);

    expect(isAuthError(error) && error.code).toBe(expectedCode);
  });
});

describe('MockAuthProvider sign up confirmation', () => {
  const registration = {
    email: 'new@mybasket.test',
    password: 'new-password',
    displayName: 'New User',
  };
  const buildProvider = () =>
    new MockAuthProvider({ ...NO_LATENCY, requireConfirmation: true });

  it('asks for confirmation instead of returning a session', async () => {
    const result = await buildProvider().signUp(registration);

    expect(result).toEqual({
      status: 'confirmationRequired',
      email: registration.email,
    });
  });

  it('does not let an unconfirmed user sign in', async () => {
    const provider = buildProvider();
    await provider.signUp(registration);

    await expect(
      provider.signIn({
        email: registration.email,
        password: registration.password,
      })
    ).rejects.toMatchObject({ code: 'invalid-credentials' });
  });

  it('lets the user sign in after confirming with the right code', async () => {
    const provider = buildProvider();
    await provider.signUp(registration);

    await provider.confirmSignUp({
      email: registration.email,
      code: MOCK_CONFIRMATION_CODE,
    });

    await expect(
      provider.signIn({
        email: registration.email,
        password: registration.password,
      })
    ).resolves.toMatchObject({ user: { email: registration.email } });
  });

  it('rejects a wrong code', async () => {
    const provider = buildProvider();
    await provider.signUp(registration);

    await expect(
      provider.confirmSignUp({ email: registration.email, code: '999999' })
    ).rejects.toMatchObject({ code: 'invalid-code' });
  });

  it('rejects an expired code', async () => {
    const provider = buildProvider();
    await provider.signUp(registration);

    await expect(
      provider.confirmSignUp({
        email: registration.email,
        code: MOCK_EXPIRED_CONFIRMATION_CODE,
      })
    ).rejects.toMatchObject({ code: 'expired-code' });
  });

  it('keeps the email reserved while the account is unconfirmed', async () => {
    const provider = buildProvider();
    await provider.signUp(registration);

    await expect(provider.signUp(registration)).rejects.toMatchObject({
      code: 'email-already-in-use',
    });
  });

  it('resolves a resend for any email', async () => {
    await expect(
      buildProvider().resendConfirmationCode('unknown@mybasket.test')
    ).resolves.toBeUndefined();
  });
});
