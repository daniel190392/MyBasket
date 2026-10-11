import { AuthError } from '../domain/errors';

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
};

type CognitoAuthenticationResult = {
  AccessToken: string;
  IdToken: string;
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
const JWT_PAYLOAD_PART_INDEX = 1;

const NAME_ATTRIBUTE = 'name';

const ERROR_CODES = new Map<string, AuthErrorCode>([
  ['NotAuthorizedException', 'invalid-credentials'],
  ['UserNotFoundException', 'invalid-credentials'],
  ['UserNotConfirmedException', 'user-not-confirmed'],
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

const toSession = ({
  AccessToken,
  IdToken,
}: CognitoAuthenticationResult): Session => {
  const { sub, email, name } = readIdTokenClaims(IdToken);
  if (!sub || !email) {
    throw new AuthError('unknown', 'ID token without required claims');
  }
  return {
    user: { id: sub, email, displayName: name ?? email },
    accessToken: AccessToken,
  };
};

export class RemoteAuthProvider implements AuthProvider {
  private readonly fetchImplementation: typeof fetch;

  constructor(private readonly options: RemoteAuthProviderOptions) {
    this.fetchImplementation = options.fetchImplementation ?? fetch;
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
    return toSession(AuthenticationResult);
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
    await this.call('ForgotPassword', {
      ClientId: this.options.clientId,
      Username: email.trim(),
    });
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
