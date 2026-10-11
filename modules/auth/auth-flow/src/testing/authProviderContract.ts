import type { AuthProvider } from '../domain/AuthProvider';
import type { Credentials } from '../domain/types';

export type ContractSubject = {
  provider: AuthProvider;
  /** A confirmed account that exists in the backend. */
  knownUser: Credentials & { displayName: string };
  /** A code the backend accepts. */
  validCode: string;
  /** A code the backend reports as expired. */
  expiredCode: string;
};

export type ContractSubjectFactory = (options?: {
  /** Every call fails as if the device had no connection. */
  isOffline?: boolean;
}) => ContractSubject;

const NEW_EMAIL = 'new@mybasket.test';
const UNKNOWN_EMAIL = 'unknown@mybasket.test';
const STRONG_PASSWORD = 'Newpass1';
const WEAK_PASSWORD = 'abc';
const WRONG_CODE = '999999';
const DISPLAY_NAME = 'New User';

const registration = {
  email: NEW_EMAIL,
  password: STRONG_PASSWORD,
  displayName: DISPLAY_NAME,
};

/**
 * Behaviors every AuthProvider must honor, run against the mock and the real
 * adapter so the mock cannot drift from what the backend does.
 */
export const describeAuthProviderContract = (
  name: string,
  createSubject: ContractSubjectFactory
) => {
  describe(`${name} honors the AuthProvider contract`, () => {
    describe('signIn', () => {
      it('returns a session for a known user', async () => {
        const { provider, knownUser } = createSubject();

        const session = await provider.signIn(knownUser);

        expect(session.user.email).toBe(knownUser.email);
        expect(session.user.displayName).toBe(knownUser.displayName);
        expect(session.accessToken).toBeTruthy();
      });

      it('rejects a wrong password with invalid-credentials', async () => {
        const { provider, knownUser } = createSubject();

        await expect(
          provider.signIn({ ...knownUser, password: 'Wrong-password-1' })
        ).rejects.toMatchObject({ code: 'invalid-credentials' });
      });

      it('rejects an unknown email like a wrong password', async () => {
        const { provider, knownUser } = createSubject();

        await expect(
          provider.signIn({
            email: UNKNOWN_EMAIL,
            password: knownUser.password,
          })
        ).rejects.toMatchObject({ code: 'invalid-credentials' });
      });
    });

    describe('signUp', () => {
      it('asks for confirmation instead of returning a session', async () => {
        const { provider } = createSubject();

        await expect(provider.signUp(registration)).resolves.toEqual({
          status: 'confirmationRequired',
          email: NEW_EMAIL,
        });
      });

      it('rejects an email that already has an account', async () => {
        const { provider, knownUser } = createSubject();

        await expect(
          provider.signUp({ ...registration, email: knownUser.email })
        ).rejects.toMatchObject({ code: 'email-already-in-use' });
      });

      it('keeps the email reserved while the account is unconfirmed', async () => {
        const { provider } = createSubject();
        await provider.signUp(registration);

        await expect(provider.signUp(registration)).rejects.toMatchObject({
          code: 'email-already-in-use',
        });
      });

      it('rejects a password that breaks the policy', async () => {
        const { provider } = createSubject();

        await expect(
          provider.signUp({ ...registration, password: WEAK_PASSWORD })
        ).rejects.toMatchObject({ code: 'weak-password' });
      });

      it('asks to confirm the account when an unconfirmed user signs in', async () => {
        const { provider } = createSubject();
        await provider.signUp(registration);

        await expect(
          provider.signIn({ email: NEW_EMAIL, password: STRONG_PASSWORD })
        ).rejects.toMatchObject({ code: 'user-not-confirmed' });
      });

      it('does not reveal an unconfirmed account to a wrong password', async () => {
        const { provider } = createSubject();
        await provider.signUp(registration);

        await expect(
          provider.signIn({ email: NEW_EMAIL, password: 'Wrong-password-1' })
        ).rejects.toMatchObject({ code: 'invalid-credentials' });
      });
    });

    describe('confirmSignUp', () => {
      it('lets the user sign in after confirming with a valid code', async () => {
        const { provider, validCode } = createSubject();
        await provider.signUp(registration);

        await provider.confirmSignUp({ email: NEW_EMAIL, code: validCode });

        await expect(
          provider.signIn({ email: NEW_EMAIL, password: STRONG_PASSWORD })
        ).resolves.toMatchObject({
          user: { email: NEW_EMAIL, displayName: DISPLAY_NAME },
        });
      });

      it('rejects a wrong code with invalid-code', async () => {
        const { provider } = createSubject();
        await provider.signUp(registration);

        await expect(
          provider.confirmSignUp({ email: NEW_EMAIL, code: WRONG_CODE })
        ).rejects.toMatchObject({ code: 'invalid-code' });
      });

      it('rejects an expired code with expired-code', async () => {
        const { provider, expiredCode } = createSubject();
        await provider.signUp(registration);

        await expect(
          provider.confirmSignUp({ email: NEW_EMAIL, code: expiredCode })
        ).rejects.toMatchObject({ code: 'expired-code' });
      });
    });

    describe('resendConfirmationCode', () => {
      it('resolves for any email so accounts are not revealed', async () => {
        const { provider } = createSubject();

        await expect(
          provider.resendConfirmationCode(UNKNOWN_EMAIL)
        ).resolves.toBeUndefined();
      });
    });

    describe('requestPasswordRecovery', () => {
      it.each([
        ['a known email', 'known'],
        ['an unknown email', 'unknown'],
      ])(
        'resolves for %s so accounts are not revealed',
        async (_label, who) => {
          const { provider, knownUser } = createSubject();
          const email = who === 'known' ? knownUser.email : UNKNOWN_EMAIL;

          await expect(
            provider.requestPasswordRecovery(email)
          ).resolves.toBeUndefined();
        }
      );

      it('resolves for an unconfirmed account so it is not told apart', async () => {
        const { provider } = createSubject();
        await provider.signUp(registration);

        await expect(
          provider.requestPasswordRecovery(NEW_EMAIL)
        ).resolves.toBeUndefined();
      });
    });

    describe('confirmPasswordRecovery', () => {
      it('replaces the password: only the new one signs in', async () => {
        const { provider, knownUser, validCode } = createSubject();

        await provider.confirmPasswordRecovery({
          email: knownUser.email,
          code: validCode,
          newPassword: STRONG_PASSWORD,
        });

        await expect(
          provider.signIn({ email: knownUser.email, password: STRONG_PASSWORD })
        ).resolves.toMatchObject({ user: { email: knownUser.email } });
        await expect(provider.signIn(knownUser)).rejects.toMatchObject({
          code: 'invalid-credentials',
        });
      });

      it('reports an unknown email as an invalid code', async () => {
        const { provider, validCode } = createSubject();

        await expect(
          provider.confirmPasswordRecovery({
            email: UNKNOWN_EMAIL,
            code: validCode,
            newPassword: STRONG_PASSWORD,
          })
        ).rejects.toMatchObject({ code: 'invalid-code' });
      });

      it('rejects a wrong code with invalid-code', async () => {
        const { provider, knownUser } = createSubject();

        await expect(
          provider.confirmPasswordRecovery({
            email: knownUser.email,
            code: WRONG_CODE,
            newPassword: STRONG_PASSWORD,
          })
        ).rejects.toMatchObject({ code: 'invalid-code' });
      });

      it('rejects an expired code with expired-code', async () => {
        const { provider, knownUser, expiredCode } = createSubject();

        await expect(
          provider.confirmPasswordRecovery({
            email: knownUser.email,
            code: expiredCode,
            newPassword: STRONG_PASSWORD,
          })
        ).rejects.toMatchObject({ code: 'expired-code' });
      });

      it('rejects a password that breaks the policy', async () => {
        const { provider, knownUser, validCode } = createSubject();

        await expect(
          provider.confirmPasswordRecovery({
            email: knownUser.email,
            code: validCode,
            newPassword: WEAK_PASSWORD,
          })
        ).rejects.toMatchObject({ code: 'weak-password' });
      });
    });

    describe('signOut', () => {
      it('resolves for a signed in session', async () => {
        const { provider, knownUser } = createSubject();
        const session = await provider.signIn(knownUser);

        await expect(provider.signOut(session)).resolves.toBeUndefined();
      });
    });

    describe('without a connection', () => {
      it.each([
        [
          'signIn',
          (subject: ContractSubject) =>
            subject.provider.signIn(subject.knownUser),
        ],
        [
          'signUp',
          (subject: ContractSubject) => subject.provider.signUp(registration),
        ],
        [
          'confirmSignUp',
          (subject: ContractSubject) =>
            subject.provider.confirmSignUp({
              email: NEW_EMAIL,
              code: subject.validCode,
            }),
        ],
        [
          'resendConfirmationCode',
          (subject: ContractSubject) =>
            subject.provider.resendConfirmationCode(NEW_EMAIL),
        ],
        [
          'requestPasswordRecovery',
          (subject: ContractSubject) =>
            subject.provider.requestPasswordRecovery(NEW_EMAIL),
        ],
        [
          'confirmPasswordRecovery',
          (subject: ContractSubject) =>
            subject.provider.confirmPasswordRecovery({
              email: NEW_EMAIL,
              code: subject.validCode,
              newPassword: STRONG_PASSWORD,
            }),
        ],
      ])('%s fails with network', async (_operation, call) => {
        const subject = createSubject({ isOffline: true });

        await expect(call(subject)).rejects.toMatchObject({ code: 'network' });
      });
    });
  });
};
