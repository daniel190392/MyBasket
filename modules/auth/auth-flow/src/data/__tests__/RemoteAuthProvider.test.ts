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
    const error = await signInFailure(errorFetch('LimitExceededException'));

    expect(isAuthError(error) && error.code).toBe('unknown');
  });

  it('maps a failed request to network', async () => {
    const error = await signInFailure(
      jest.fn().mockRejectedValue(new TypeError('offline'))
    );

    expect(isAuthError(error) && error.code).toBe('network');
  });
});
