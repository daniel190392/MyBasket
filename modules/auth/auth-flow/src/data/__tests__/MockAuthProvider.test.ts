import { isAuthError } from '../../domain/errors';
import { DEFAULT_MOCK_USERS, MockAuthProvider } from '../MockAuthProvider';

const [demoUser] = DEFAULT_MOCK_USERS;
const NO_LATENCY = { latencyMs: 0 };

describe('MockAuthProvider', () => {
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
    jest.useRealTimers();
  });
});
