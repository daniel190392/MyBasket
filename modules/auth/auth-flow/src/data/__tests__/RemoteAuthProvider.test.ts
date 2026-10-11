import { isAuthError } from '../../domain/errors';
import { RemoteAuthProvider } from '../RemoteAuthProvider';

// Node global, used only to build fake tokens.
declare const Buffer: {
  from(value: string): { toString(encoding: 'base64url'): string };
};

const OPTIONS = {
  clientId: 'test-client-id',
  endpoint: 'https://auth.mybasket.test/',
};
const CREDENTIALS = { email: 'user@mybasket.test', password: 'fake-password' };
const FAKE_ACCESS_TOKEN = 'fake-access';
const USER_ID = 'id-1';
const DISPLAY_NAME = 'Núñez Ñandú';
const OK_STATUS = 200;
const BAD_REQUEST_STATUS = 400;

const encodeSegment = (value: object) =>
  Buffer.from(JSON.stringify(value)).toString('base64url');

const buildIdToken = (claims: object) =>
  `${encodeSegment({ alg: 'none' })}.${encodeSegment(claims)}.signature`;

const jsonResponse = (body: object, status = OK_STATUS) =>
  Promise.resolve(new Response(JSON.stringify(body), { status }));

const successFetch = (claims: object) =>
  jest.fn().mockReturnValue(
    jsonResponse({
      AuthenticationResult: {
        AccessToken: FAKE_ACCESS_TOKEN,
        IdToken: buildIdToken(claims),
      },
    })
  );

const errorFetch = (errorType: string) =>
  jest
    .fn()
    .mockReturnValue(jsonResponse({ __type: errorType }, BAD_REQUEST_STATUS));

const buildProvider = (fetchImplementation: jest.Mock) =>
  new RemoteAuthProvider({ ...OPTIONS, fetchImplementation });

const signInFailure = (fetchImplementation: jest.Mock) =>
  buildProvider(fetchImplementation)
    .signIn(CREDENTIALS)
    .catch((caught) => caught);

describe('RemoteAuthProvider.signIn', () => {
  it('sends a USER_PASSWORD_AUTH request to the backend', async () => {
    const fetchMock = successFetch({ sub: USER_ID, email: CREDENTIALS.email });

    await buildProvider(fetchMock).signIn(CREDENTIALS);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(OPTIONS.endpoint);
    expect(init.headers['X-Amz-Target']).toBe(
      'AWSCognitoIdentityProviderService.InitiateAuth'
    );
    expect(JSON.parse(init.body)).toEqual({
      ClientId: OPTIONS.clientId,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: CREDENTIALS.email,
        PASSWORD: CREDENTIALS.password,
      },
    });
  });

  it('builds the session from the ID token claims', async () => {
    const fetchMock = successFetch({
      sub: USER_ID,
      email: CREDENTIALS.email,
      name: DISPLAY_NAME,
    });

    const session = await buildProvider(fetchMock).signIn(CREDENTIALS);

    expect(session).toEqual({
      user: {
        id: USER_ID,
        email: CREDENTIALS.email,
        displayName: DISPLAY_NAME,
      },
      accessToken: FAKE_ACCESS_TOKEN,
    });
  });

  it('maps NotAuthorizedException to invalid-credentials', async () => {
    const error = await signInFailure(errorFetch('NotAuthorizedException'));

    expect(isAuthError(error) && error.code).toBe('invalid-credentials');
  });

  it('maps other backend errors to unknown', async () => {
    const error = await signInFailure(errorFetch('InternalErrorException'));

    expect(isAuthError(error) && error.code).toBe('unknown');
  });

  it('maps a failed request to network', async () => {
    const error = await signInFailure(
      jest.fn().mockRejectedValue(new TypeError('offline'))
    );

    expect(isAuthError(error) && error.code).toBe('network');
  });
});

describe('RemoteAuthProvider.signUp', () => {
  const registration = { ...CREDENTIALS, displayName: DISPLAY_NAME };

  it('sends the display name as the name attribute', async () => {
    const fetchMock = jest
      .fn()
      .mockReturnValue(jsonResponse({ UserConfirmed: false }));

    await buildProvider(fetchMock).signUp(registration);

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers['X-Amz-Target']).toBe(
      'AWSCognitoIdentityProviderService.SignUp'
    );
    expect(JSON.parse(init.body)).toEqual({
      ClientId: OPTIONS.clientId,
      Username: CREDENTIALS.email,
      Password: CREDENTIALS.password,
      UserAttributes: [{ Name: 'name', Value: DISPLAY_NAME }],
    });
  });

  it('asks for confirmation when the account is not confirmed', async () => {
    const fetchMock = jest
      .fn()
      .mockReturnValue(jsonResponse({ UserConfirmed: false }));

    const result = await buildProvider(fetchMock).signUp(registration);

    expect(result).toEqual({
      status: 'confirmationRequired',
      email: CREDENTIALS.email,
    });
  });

  it('signs in right away when the backend confirms the account', async () => {
    const fetchMock = jest
      .fn()
      .mockReturnValueOnce(jsonResponse({ UserConfirmed: true }))
      .mockReturnValueOnce(
        jsonResponse({
          AuthenticationResult: {
            AccessToken: FAKE_ACCESS_TOKEN,
            IdToken: buildIdToken({ sub: USER_ID, email: CREDENTIALS.email }),
          },
        })
      );

    const result = await buildProvider(fetchMock).signUp(registration);

    expect(result.status).toBe('signedIn');
  });

  it('maps UsernameExistsException to email-already-in-use', async () => {
    const error = await buildProvider(errorFetch('UsernameExistsException'))
      .signUp(registration)
      .catch((caught) => caught);

    expect(isAuthError(error) && error.code).toBe('email-already-in-use');
  });

  it('maps InvalidPasswordException to weak-password', async () => {
    const error = await buildProvider(errorFetch('InvalidPasswordException'))
      .signUp(registration)
      .catch((caught) => caught);

    expect(isAuthError(error) && error.code).toBe('weak-password');
  });
});

describe('RemoteAuthProvider.confirmSignUp', () => {
  const confirmation = { email: CREDENTIALS.email, code: '123456' };

  it('sends the confirmation code to the backend', async () => {
    const fetchMock = jest.fn().mockReturnValue(jsonResponse({}));

    await buildProvider(fetchMock).confirmSignUp(confirmation);

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers['X-Amz-Target']).toBe(
      'AWSCognitoIdentityProviderService.ConfirmSignUp'
    );
    expect(JSON.parse(init.body)).toEqual({
      ClientId: OPTIONS.clientId,
      Username: CREDENTIALS.email,
      ConfirmationCode: confirmation.code,
    });
  });

  it.each([
    ['CodeMismatchException', 'invalid-code'],
    ['ExpiredCodeException', 'expired-code'],
    ['LimitExceededException', 'too-many-requests'],
    ['TooManyRequestsException', 'too-many-requests'],
  ])('maps %s to %s', async (errorType, expectedCode) => {
    const error = await buildProvider(errorFetch(errorType))
      .confirmSignUp(confirmation)
      .catch((caught) => caught);

    expect(isAuthError(error) && error.code).toBe(expectedCode);
  });
});

describe('RemoteAuthProvider.signOut', () => {
  const session = {
    user: { id: USER_ID, email: CREDENTIALS.email, displayName: DISPLAY_NAME },
    accessToken: FAKE_ACCESS_TOKEN,
  };

  it('revokes the session in the backend with the access token', async () => {
    const fetchMock = jest.fn().mockReturnValue(jsonResponse({}));

    await buildProvider(fetchMock).signOut(session);

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers['X-Amz-Target']).toBe(
      'AWSCognitoIdentityProviderService.GlobalSignOut'
    );
    expect(JSON.parse(init.body)).toEqual({ AccessToken: FAKE_ACCESS_TOKEN });
  });

  it('reports an expired token as invalid credentials', async () => {
    const error = await buildProvider(errorFetch('NotAuthorizedException'))
      .signOut(session)
      .catch((caught) => caught);

    expect(isAuthError(error) && error.code).toBe('invalid-credentials');
  });
});

describe('RemoteAuthProvider password recovery', () => {
  const confirmation = {
    email: CREDENTIALS.email,
    code: '123456',
    newPassword: 'New-password-1',
  };

  it('asks the backend to send a recovery code', async () => {
    const fetchMock = jest.fn().mockReturnValue(jsonResponse({}));

    await buildProvider(fetchMock).requestPasswordRecovery(CREDENTIALS.email);

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers['X-Amz-Target']).toBe(
      'AWSCognitoIdentityProviderService.ForgotPassword'
    );
    expect(JSON.parse(init.body)).toEqual({
      ClientId: OPTIONS.clientId,
      Username: CREDENTIALS.email,
    });
  });

  it('sends the code and the new password to the backend', async () => {
    const fetchMock = jest.fn().mockReturnValue(jsonResponse({}));

    await buildProvider(fetchMock).confirmPasswordRecovery(confirmation);

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers['X-Amz-Target']).toBe(
      'AWSCognitoIdentityProviderService.ConfirmForgotPassword'
    );
    expect(JSON.parse(init.body)).toEqual({
      ClientId: OPTIONS.clientId,
      Username: CREDENTIALS.email,
      ConfirmationCode: confirmation.code,
      Password: confirmation.newPassword,
    });
  });

  it.each([
    ['CodeMismatchException', 'invalid-code'],
    ['ExpiredCodeException', 'expired-code'],
    ['InvalidPasswordException', 'weak-password'],
    ['LimitExceededException', 'too-many-requests'],
    ['TooManyFailedAttemptsException', 'too-many-requests'],
  ])('maps %s to %s', async (errorType, expectedCode) => {
    const error = await buildProvider(errorFetch(errorType))
      .confirmPasswordRecovery(confirmation)
      .catch((caught) => caught);

    expect(isAuthError(error) && error.code).toBe(expectedCode);
  });
});

describe('RemoteAuthProvider.resendConfirmationCode', () => {
  it('asks the backend for a new code', async () => {
    const fetchMock = jest.fn().mockReturnValue(jsonResponse({}));

    await buildProvider(fetchMock).resendConfirmationCode(CREDENTIALS.email);

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers['X-Amz-Target']).toBe(
      'AWSCognitoIdentityProviderService.ResendConfirmationCode'
    );
    expect(JSON.parse(init.body)).toEqual({
      ClientId: OPTIONS.clientId,
      Username: CREDENTIALS.email,
    });
  });

  it('maps a throttled request to too-many-requests', async () => {
    const error = await buildProvider(errorFetch('LimitExceededException'))
      .resendConfirmationCode(CREDENTIALS.email)
      .catch((caught) => caught);

    expect(isAuthError(error) && error.code).toBe('too-many-requests');
  });
});
