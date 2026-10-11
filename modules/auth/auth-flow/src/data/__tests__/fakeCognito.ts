// Node global, used only to build fake tokens.
declare const Buffer: {
  from(value: string): { toString(encoding: 'base64url'): string };
};

export type FakeCognitoUser = {
  email: string;
  password: string;
  displayName: string;
};

export type FakeCognitoOptions = {
  /** Accounts that already exist and are confirmed. */
  users: FakeCognitoUser[];
  validCode: string;
  expiredCode: string;
  /** Every request fails as if the device had no connection. */
  isOffline?: boolean;
};

type StoredUser = FakeCognitoUser & { id: string; isConfirmed: boolean };

const OK_STATUS = 200;
const BAD_REQUEST_STATUS = 400;
const TARGET_HEADER = 'X-Amz-Target';
const MIN_PASSWORD_LENGTH = 8;

const encodeSegment = (value: object) =>
  Buffer.from(JSON.stringify(value)).toString('base64url');

const buildIdToken = ({ id, email, displayName }: StoredUser) =>
  `${encodeSegment({ alg: 'none' })}.${encodeSegment({
    sub: id,
    email,
    name: displayName,
  })}.signature`;

// The pool policy the backend reported: 8+ characters with a lowercase
// letter, an uppercase letter and a digit.
const meetsPasswordPolicy = (password: string) =>
  password.length >= MIN_PASSWORD_LENGTH &&
  /[a-z]/.test(password) &&
  /[A-Z]/.test(password) &&
  /\d/.test(password);

const json = (body: object, status = OK_STATUS) =>
  new Response(JSON.stringify(body), { status });

const failure = (errorType: string) =>
  json({ __type: errorType }, BAD_REQUEST_STATUS);

const CODE_DELIVERY = {
  CodeDeliveryDetails: { DeliveryMedium: 'EMAIL', AttributeName: 'email' },
};

/**
 * In-memory stand-in for the Cognito endpoint. It only reproduces behaviors
 * that are documented or that the backend verified against the real pool:
 * unknown emails never reveal themselves on sign in, resend and recovery.
 * Anything it does not know is a request the adapter should not send.
 */
export class FakeCognito {
  private readonly users = new Map<string, StoredUser>();
  private readonly accessTokens = new Set<string>();

  constructor(private readonly options: FakeCognitoOptions) {
    options.users.forEach((user, index) =>
      this.users.set(user.email, {
        ...user,
        id: `fake-user-${index}`,
        isConfirmed: true,
      })
    );
  }

  readonly fetch: typeof fetch = async (_input, init) => {
    if (this.options.isOffline) {
      throw new TypeError('Network request failed');
    }

    const headers = init?.headers as Record<string, string>;
    const operation = headers[TARGET_HEADER].split('.').pop() ?? '';
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    return this.handle(operation, body);
  };

  private handle(operation: string, body: Record<string, unknown>): Response {
    switch (operation) {
      case 'InitiateAuth':
        return this.initiateAuth(body.AuthParameters as Record<string, string>);
      case 'SignUp':
        return this.signUp(body);
      case 'ConfirmSignUp':
        return this.confirmSignUp(body);
      case 'ResendConfirmationCode':
      case 'ForgotPassword':
        return json(CODE_DELIVERY);
      case 'ConfirmForgotPassword':
        return this.confirmForgotPassword(body);
      case 'GlobalSignOut':
        return this.globalSignOut(body);
      default:
        return failure('InvalidParameterException');
    }
  }

  private initiateAuth({
    USERNAME: username,
    PASSWORD: password,
  }: Record<string, string>): Response {
    const user = this.users.get(username);
    if (!user || user.password !== password) {
      return failure('NotAuthorizedException');
    }
    if (!user.isConfirmed) {
      return failure('UserNotConfirmedException');
    }

    const accessToken = `fake-access-${user.id}-${this.accessTokens.size}`;
    this.accessTokens.add(accessToken);
    return json({
      AuthenticationResult: {
        AccessToken: accessToken,
        IdToken: buildIdToken(user),
      },
    });
  }

  private signUp(body: Record<string, unknown>): Response {
    const email = String(body.Username);
    const password = String(body.Password);
    const [{ Value: displayName }] = body.UserAttributes as { Value: string }[];

    if (!meetsPasswordPolicy(password)) {
      return failure('InvalidPasswordException');
    }
    if (this.users.has(email)) {
      return failure('UsernameExistsException');
    }

    this.users.set(email, {
      email,
      password,
      displayName,
      id: `fake-user-${this.users.size}`,
      isConfirmed: false,
    });
    return json({ UserConfirmed: false });
  }

  private confirmSignUp(body: Record<string, unknown>): Response {
    const user = this.users.get(String(body.Username));
    const codeFailure = this.checkCode(String(body.ConfirmationCode));
    if (codeFailure) return codeFailure;
    if (!user) return failure('UserNotFoundException');

    user.isConfirmed = true;
    return json({});
  }

  private confirmForgotPassword(body: Record<string, unknown>): Response {
    const user = this.users.get(String(body.Username));
    const codeFailure = this.checkCode(String(body.ConfirmationCode));
    if (codeFailure) return codeFailure;
    // An unknown email reads as a wrong code, as the backend verified.
    if (!user) return failure('CodeMismatchException');

    const password = String(body.Password);
    if (!meetsPasswordPolicy(password)) {
      return failure('InvalidPasswordException');
    }

    user.password = password;
    return json({});
  }

  private globalSignOut(body: Record<string, unknown>): Response {
    const accessToken = String(body.AccessToken);
    if (!this.accessTokens.delete(accessToken)) {
      return failure('NotAuthorizedException');
    }
    return json({});
  }

  private checkCode(code: string): Response | null {
    if (code === this.options.expiredCode) {
      return failure('ExpiredCodeException');
    }
    if (code !== this.options.validCode) {
      return failure('CodeMismatchException');
    }
    return null;
  }
}
