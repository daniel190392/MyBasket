import { isAuthError } from '../../domain/errors';
import { describeAuthProviderContract } from '../authProviderContract';
import {
  DEFAULT_MOCK_USERS,
  MOCK_CONFIRMATION_CODE,
  MOCK_EXPIRED_CONFIRMATION_CODE,
  MockAuthProvider,
} from '../MockAuthProvider';

import type { ContractSubjectFactory } from '../authProviderContract';

const [demoUser] = DEFAULT_MOCK_USERS;
const NO_LATENCY = { latencyMs: 0 };
const STRONG_PASSWORD = 'Newpass1';

const createMockSubject: ContractSubjectFactory = ({
  isOffline = false,
} = {}) => ({
  provider: new MockAuthProvider({
    ...NO_LATENCY,
    requireConfirmation: true,
    failWith: isOffline ? 'network' : undefined,
  }),
  knownUser: demoUser,
  validCode: MOCK_CONFIRMATION_CODE,
  expiredCode: MOCK_EXPIRED_CONFIRMATION_CODE,
});

describeAuthProviderContract('MockAuthProvider', createMockSubject);

// What the contract cannot say: the options and the isolation that only the
// mock has.
describe('MockAuthProvider options and isolation', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('matches the email ignoring case and surrounding spaces', async () => {
    const provider = new MockAuthProvider(NO_LATENCY);

    const session = await provider.signIn({
      email: `  ${demoUser.email.toUpperCase()} `,
      password: demoUser.password,
    });

    expect(session.user.email).toBe(demoUser.email);
  });

  it('signs a new user in right away unless confirmation is required', async () => {
    const provider = new MockAuthProvider(NO_LATENCY);
    const registration = {
      email: 'new@mybasket.test',
      password: STRONG_PASSWORD,
      displayName: 'New User',
    };

    const result = await provider.signUp(registration);
    const session = await provider.signIn({
      email: registration.email,
      password: registration.password,
    });

    expect(result).toEqual({ status: 'signedIn', session });
  });

  it('does not share registered users between instances', async () => {
    const registration = {
      email: 'new@mybasket.test',
      password: STRONG_PASSWORD,
      displayName: 'New User',
    };
    await new MockAuthProvider(NO_LATENCY).signUp(registration);

    await expect(
      new MockAuthProvider(NO_LATENCY).signUp(registration)
    ).resolves.toBeDefined();
  });

  it('does not change the shared default users when a password changes', async () => {
    const provider = new MockAuthProvider(NO_LATENCY);

    await provider.confirmPasswordRecovery({
      email: demoUser.email,
      code: MOCK_CONFIRMATION_CODE,
      newPassword: STRONG_PASSWORD,
    });

    expect(demoUser.password).not.toBe(STRONG_PASSWORD);
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

  it('fails every call with the forced error code', async () => {
    const provider = new MockAuthProvider({
      ...NO_LATENCY,
      failWith: 'unknown',
    });

    const error = await provider
      .signIn({ email: demoUser.email, password: demoUser.password })
      .catch((caught: unknown) => caught);

    expect(isAuthError(error)).toBe(true);
    expect(error).toMatchObject({ code: 'unknown' });
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
