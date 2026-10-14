import { isAuthError } from '../../domain/errors';
import { describeAuthProviderContract } from '../../testing/authProviderContract';
import { RemoteAuthProvider } from '../RemoteAuthProvider';
import { FakeCognito } from './fakeCognito';

import type { ContractSubjectFactory } from '../../testing/authProviderContract';

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
const FAKE_REFRESH_TOKEN = 'fake-refresh';
const RENEWED_ACCESS_TOKEN = 'renewed-access';
const EXPIRES_IN_SECONDS = 3600;
const NOW_MS = 1_700_000_000_000;
const EXPECTED_EXPIRES_AT = NOW_MS + EXPIRES_IN_SECONDS * 1000;
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
        ExpiresIn: EXPIRES_IN_SECONDS,
        RefreshToken: FAKE_REFRESH_TOKEN,
      },
    })
  );

// A renewal answers without a refresh token.
const renewalFetch = (claims: object) =>
  jest.fn().mockReturnValue(
    jsonResponse({
      AuthenticationResult: {
        AccessToken: RENEWED_ACCESS_TOKEN,
        IdToken: buildIdToken(claims),
        ExpiresIn: EXPIRES_IN_SECONDS,
      },
    })
  );

const errorFetch = (errorType: string) =>
  jest
    .fn()
    .mockReturnValue(jsonResponse({ __type: errorType }, BAD_REQUEST_STATUS));

const buildProvider = (fetchImplementation: jest.Mock) =>
  new RemoteAuthProvider({
    ...OPTIONS,
    fetchImplementation,
    now: () => NOW_MS,
  });

describe('RemoteAuthProvider', () => {
  it('rejects an endpoint that is not https', () => {
    expect(
      () =>
        new RemoteAuthProvider({
          ...OPTIONS,
          endpoint: 'http://auth.mybasket.test/',
        })
    ).toThrow('https');
  });

  it('accepts an https scheme written in uppercase', () => {
    expect(
      () =>
        new RemoteAuthProvider({
          ...OPTIONS,
          endpoint: 'HTTPS://auth.mybasket.test/',
        })
    ).not.toThrow();
  });
});

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
      refreshToken: FAKE_REFRESH_TOKEN,
      accessTokenExpiresAt: EXPECTED_EXPIRES_AT,
    });
  });

  it('fails when the backend does not return a refresh token', async () => {
    const fetchMock = renewalFetch({
      sub: USER_ID,
      email: CREDENTIALS.email,
    });

    const error = await buildProvider(fetchMock)
      .signIn(CREDENTIALS)
      .catch((caught) => caught);

    expect(isAuthError(error) && error.code).toBe('unknown');
  });
});

describe('RemoteAuthProvider.refreshSession', () => {
  const session = {
    user: { id: USER_ID, email: CREDENTIALS.email, displayName: DISPLAY_NAME },
    accessToken: FAKE_ACCESS_TOKEN,
    refreshToken: FAKE_REFRESH_TOKEN,
    accessTokenExpiresAt: 0,
  };
  const claims = {
    sub: USER_ID,
    email: CREDENTIALS.email,
    name: DISPLAY_NAME,
  };

  it('sends a REFRESH_TOKEN_AUTH request with the refresh token', async () => {
    const fetchMock = renewalFetch(claims);

    await buildProvider(fetchMock).refreshSession(session);

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers['X-Amz-Target']).toBe(
      'AWSCognitoIdentityProviderService.InitiateAuth'
    );
    expect(JSON.parse(init.body)).toEqual({
      ClientId: OPTIONS.clientId,
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      AuthParameters: { REFRESH_TOKEN: FAKE_REFRESH_TOKEN },
    });
  });

  it('returns a new access token and keeps the refresh token', async () => {
    const renewed = await buildProvider(renewalFetch(claims)).refreshSession(
      session
    );

    expect(renewed).toEqual({
      user: session.user,
      accessToken: RENEWED_ACCESS_TOKEN,
      refreshToken: FAKE_REFRESH_TOKEN,
      accessTokenExpiresAt: EXPECTED_EXPIRES_AT,
    });
  });

  it('reports a refresh token the backend rejects as session-expired', async () => {
    const error = await buildProvider(errorFetch('NotAuthorizedException'))
      .refreshSession(session)
      .catch((caught) => caught);

    expect(isAuthError(error) && error.code).toBe('session-expired');
  });

  it('does not report another failure as session-expired', async () => {
    const error = await buildProvider(errorFetch('LimitExceededException'))
      .refreshSession(session)
      .catch((caught) => caught);

    expect(isAuthError(error) && error.code).toBe('too-many-requests');
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

  it('signs in right away when the backend confirms the account', async () => {
    const fetchMock = jest
      .fn()
      .mockReturnValueOnce(jsonResponse({ UserConfirmed: true }))
      .mockReturnValueOnce(
        jsonResponse({
          AuthenticationResult: {
            AccessToken: FAKE_ACCESS_TOKEN,
            IdToken: buildIdToken({ sub: USER_ID, email: CREDENTIALS.email }),
            ExpiresIn: EXPIRES_IN_SECONDS,
            RefreshToken: FAKE_REFRESH_TOKEN,
          },
        })
      );

    const result = await buildProvider(fetchMock).signUp(registration);

    expect(result.status).toBe('signedIn');
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
});

describe('RemoteAuthProvider.signOut', () => {
  const session = {
    user: { id: USER_ID, email: CREDENTIALS.email, displayName: DISPLAY_NAME },
    accessToken: FAKE_ACCESS_TOKEN,
    refreshToken: FAKE_REFRESH_TOKEN,
    accessTokenExpiresAt: EXPECTED_EXPIRES_AT,
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

  it('does not hide a failure other than the unconfirmed account', async () => {
    const error = await buildProvider(errorFetch('LimitExceededException'))
      .requestPasswordRecovery(CREDENTIALS.email)
      .catch((caught) => caught);

    expect(isAuthError(error) && error.code).toBe('too-many-requests');
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
});

describe('RemoteAuthProvider error mapping', () => {
  // One table serves every operation, so one operation is enough to test it.
  it.each([
    ['NotAuthorizedException', 'invalid-credentials'],
    ['UserNotFoundException', 'invalid-credentials'],
    ['UserNotConfirmedException', 'user-not-confirmed'],
    ['InvalidParameterException', 'invalid-request'],
    ['UsernameExistsException', 'email-already-in-use'],
    ['InvalidPasswordException', 'weak-password'],
    ['CodeMismatchException', 'invalid-code'],
    ['ExpiredCodeException', 'expired-code'],
    ['LimitExceededException', 'too-many-requests'],
    ['TooManyRequestsException', 'too-many-requests'],
    ['TooManyFailedAttemptsException', 'too-many-requests'],
    ['InternalErrorException', 'unknown'],
  ])('maps %s to %s', async (errorType, expectedCode) => {
    const error = await buildProvider(errorFetch(errorType))
      .confirmSignUp({ email: CREDENTIALS.email, code: '123456' })
      .catch((caught) => caught);

    expect(isAuthError(error) && error.code).toBe(expectedCode);
  });
});

const CONTRACT_USER = {
  email: 'demo@mybasket.test',
  password: 'Demo-password-1',
  displayName: 'Demo User',
};
const CONTRACT_VALID_CODE = '123456';
const CONTRACT_EXPIRED_CODE = '000000';

const createRemoteSubject: ContractSubjectFactory = ({
  isOffline = false,
} = {}) => {
  const cognito = new FakeCognito({
    users: [CONTRACT_USER],
    validCode: CONTRACT_VALID_CODE,
    expiredCode: CONTRACT_EXPIRED_CODE,
    isOffline,
  });
  return {
    provider: new RemoteAuthProvider({
      ...OPTIONS,
      fetchImplementation: cognito.fetch,
    }),
    knownUser: CONTRACT_USER,
    validCode: CONTRACT_VALID_CODE,
    expiredCode: CONTRACT_EXPIRED_CODE,
  };
};

describeAuthProviderContract('RemoteAuthProvider', createRemoteSubject);
