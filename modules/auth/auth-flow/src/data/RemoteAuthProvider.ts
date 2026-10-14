import { AuthError, isAuthError } from '../domain/errors';

import type { AuthErrorCode } from '../domain/errors';
import type { AuthProvider } from '../domain/AuthProvider';
import type {
  Credentials,
  PasswordRecoveryConfirmation,
  Registration,
  Session,
  SignUpConfirmation,
  SignUpResult,
} from '../domain/types';

export type RemoteAuthProviderOptions = {
  clientId: string;
  endpoint: string;
  fetchImplementation?: typeof fetch;
  /** Clock used to compute when an access token expires. */
  now?: () => number;
};

type CognitoAuthenticationResult = {
  AccessToken: string;
  IdToken: string;
  /** Lifetime of the access token, in seconds. */
  ExpiresIn: number;
  /** Absent when the result comes from a token renewal. */
  RefreshToken?: string;
};

type CognitoResponseBody = {
  __type?: string;
  AuthenticationResult?: CognitoAuthenticationResult;
  UserConfirmed?: boolean;
};

type IdTokenClaims = {
  sub?: string;
  email?: string;
  name?: string;
};

// Provided by Hermes at runtime but missing from the React Native typings.
declare const atob: (encoded: string) => string;

const AMZ_JSON_CONTENT_TYPE = 'application/x-amz-json-1.1';
const TARGET_PREFIX = 'AWSCognitoIdentityProviderService';
const USER_PASSWORD_AUTH_FLOW = 'USER_PASSWORD_AUTH';
const REFRESH_TOKEN_AUTH_FLOW = 'REFRESH_TOKEN_AUTH';
const MILLISECONDS_PER_SECOND = 1000;
const JWT_PAYLOAD_PART_INDEX = 1;

const NAME_ATTRIBUTE = 'name';
const HTTPS_PREFIX = 'https://';

const ERROR_CODES = new Map<string, AuthErrorCode>([
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
]);

// atob yields a binary string; decoding it as percent-encoded bytes keeps
// non-ASCII names (accents) intact.
const decodeBase64Url = (value: string): string => {
  const binary = atob(value.replace(/-/g, '+').replace(/_/g, '/'));
  const percentEncoded = Array.from(
    binary,
    (character: string) =>
      `%${character.charCodeAt(0).toString(16).padStart(2, '0')}`
  ).join('');
  return decodeURIComponent(percentEncoded);
};

const readIdTokenClaims = (idToken: string): IdTokenClaims => {
  const payload = idToken.split('.')[JWT_PAYLOAD_PART_INDEX];
  if (!payload) {
    throw new AuthError('unknown', 'Malformed ID token');
  }
  return JSON.parse(decodeBase64Url(payload)) as IdTokenClaims;
};

const toSession = (
  { AccessToken, IdToken, ExpiresIn }: CognitoAuthenticationResult,
  refreshToken: string,
  now: number
): Session => {
  const { sub, email, name } = readIdTokenClaims(IdToken);
  if (!sub || !email) {
    throw new AuthError('unknown', 'ID token without required claims');
  }
  return {
    user: { id: sub, email, displayName: name ?? email },
    accessToken: AccessToken,
    refreshToken,
    accessTokenExpiresAt: now + ExpiresIn * MILLISECONDS_PER_SECOND,
  };
};

export class RemoteAuthProvider implements AuthProvider {
  private readonly fetchImplementation: typeof fetch;
  private readonly now: () => number;

  constructor(private readonly options: RemoteAuthProviderOptions) {
    // Credentials and tokens travel in these requests, so a plain http
    // endpoint must fail at startup instead of leaking them on the network.
    if (!options.endpoint.startsWith(HTTPS_PREFIX)) {
      throw new Error('RemoteAuthProvider requires an https endpoint');
    }
    this.fetchImplementation = options.fetchImplementation ?? fetch;
    this.now = options.now ?? Date.now;
  }

  async signIn({ email, password }: Credentials): Promise<Session> {
    const { AuthenticationResult } = await this.call('InitiateAuth', {
      ClientId: this.options.clientId,
      AuthFlow: USER_PASSWORD_AUTH_FLOW,
      AuthParameters: { USERNAME: email.trim(), PASSWORD: password },
    });

    if (!AuthenticationResult) {
      // A challenge (MFA, new password) is not supported by this client.
      throw new AuthError('unknown', 'Unsupported authentication challenge');
    }
    const { RefreshToken } = AuthenticationResult;
    if (!RefreshToken) {
      throw new AuthError(
        'unknown',
        'Authentication result without refresh token'
      );
    }
    return toSession(AuthenticationResult, RefreshToken, this.now());
  }

  async refreshSession(session: Session): Promise<Session> {
    try {
      const { AuthenticationResult } = await this.call('InitiateAuth', {
        ClientId: this.options.clientId,
        AuthFlow: REFRESH_TOKEN_AUTH_FLOW,
        AuthParameters: { REFRESH_TOKEN: session.refreshToken },
      });

      if (!AuthenticationResult) {
        throw new AuthError('unknown', 'Renewal without authentication result');
      }
      // A renewal does not issue a new refresh token, so the current one stays.
      return toSession(AuthenticationResult, session.refreshToken, this.now());
    } catch (error) {
      // The backend answers a refresh token it no longer accepts the same way
      // as wrong credentials; for a renewal that means the session is over.
      if (isAuthError(error) && error.code === 'invalid-credentials') {
        throw new AuthError('session-expired');
      }
      throw error;
    }
  }

  async signUp({
    email,
    password,
    displayName,
  }: Registration): Promise<SignUpResult> {
    const username = email.trim();
    const { UserConfirmed } = await this.call('SignUp', {
      ClientId: this.options.clientId,
      Username: username,
      Password: password,
      UserAttributes: [{ Name: NAME_ATTRIBUTE, Value: displayName }],
    });

    if (UserConfirmed) {
      const session = await this.signIn({ email: username, password });
      return { status: 'signedIn', session };
    }
    return { status: 'confirmationRequired', email: username };
  }

  async confirmSignUp({ email, code }: SignUpConfirmation): Promise<void> {
    await this.call('ConfirmSignUp', {
      ClientId: this.options.clientId,
      Username: email.trim(),
      ConfirmationCode: code,
    });
  }

  async resendConfirmationCode(email: string): Promise<void> {
    await this.call('ResendConfirmationCode', {
      ClientId: this.options.clientId,
      Username: email.trim(),
    });
  }

  async signOut({ accessToken }: Session): Promise<void> {
    await this.call('GlobalSignOut', { AccessToken: accessToken });
  }

  async requestPasswordRecovery(email: string): Promise<void> {
    try {
      await this.call('ForgotPassword', {
        ClientId: this.options.clientId,
        Username: email.trim(),
      });
    } catch (error) {
      // An unconfirmed account rejects the request while an unknown email
      // answers as if it worked; hiding the difference keeps the response
      // from revealing which emails have a pending sign up.
      if (isAuthError(error) && error.code === 'invalid-request') return;
      throw error;
    }
  }

  async confirmPasswordRecovery({
    email,
    code,
    newPassword,
  }: PasswordRecoveryConfirmation): Promise<void> {
    await this.call('ConfirmForgotPassword', {
      ClientId: this.options.clientId,
      Username: email.trim(),
      ConfirmationCode: code,
      Password: newPassword,
    });
  }

  private async call(
    operation: string,
    payload: Record<string, unknown>
  ): Promise<CognitoResponseBody> {
    let response: Response;
    try {
      response = await this.fetchImplementation(this.options.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': AMZ_JSON_CONTENT_TYPE,
          'X-Amz-Target': `${TARGET_PREFIX}.${operation}`,
        },
        body: JSON.stringify(payload),
      });
    } catch {
      throw new AuthError('network');
    }

    const body = (await response
      .json()
      .catch(() => ({}))) as CognitoResponseBody;
    if (response.ok) {
      return body;
    }
    throw this.toAuthError(body.__type);
  }

  private toAuthError(cognitoErrorType?: string): AuthError {
    const errorName = cognitoErrorType?.split('#').pop() ?? '';
    const code = ERROR_CODES.get(errorName);
    if (code) {
      return new AuthError(code);
    }
    return new AuthError('unknown', errorName || 'Unexpected Cognito error');
  }
}
