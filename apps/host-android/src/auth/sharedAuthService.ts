import { AuthService, RemoteAuthProvider, SecureSessionStorage } from 'auth-flow';
import { secureStorage } from 'secure-storage';

export type AuthConfig = {
  clientId?: string;
  endpoint?: string;
};

export type AuthSetup = { service: AuthService } | { problem: string };

const MISSING_CONFIG_PROBLEM =
  'Set auth.clientId and auth.endpoint in local.properties (see local.properties.example).';

type SharedService = {
  clientId: string;
  endpoint: string;
  service: AuthService;
};

// Every React Native root of the host is a separate React tree, so the session
// cannot travel in a context: they all use this one service instance instead.
// A different configuration builds a new service.
let shared: SharedService | undefined;

// An invalid setting (for example an http endpoint) is reported on screen
// instead of crashing the app while it renders.
export function getAuthSetup({ clientId, endpoint }: AuthConfig): AuthSetup {
  if (!clientId || !endpoint) return { problem: MISSING_CONFIG_PROBLEM };

  if (shared?.clientId === clientId && shared.endpoint === endpoint) {
    return { service: shared.service };
  }

  try {
    const service = new AuthService(
      new RemoteAuthProvider({ clientId, endpoint }),
      new SecureSessionStorage(secureStorage)
    );
    shared = { clientId, endpoint, service };
    return { service };
  } catch (error) {
    return {
      problem: error instanceof Error ? error.message : MISSING_CONFIG_PROBLEM,
    };
  }
}
