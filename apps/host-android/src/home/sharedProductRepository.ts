import { createApiClient } from 'api-client';

import { getAuthSetup } from '../auth/sharedAuthService';
import { createApiProductRepository } from './apiProductRepository';

import type { ProductRepository } from 'feature-home';
import type { AuthConfig } from '../auth/sharedAuthService';

export type HomeConfig = AuthConfig & {
  apiBaseUrl?: string;
};

export type ProductRepositorySetup =
  { repository: ProductRepository } | { problem: string };

const MISSING_CONFIG_PROBLEM =
  'Set api.baseUrl in local.properties (see local.properties.example).';
const INSECURE_URL_PROBLEM = 'api.baseUrl must be an https URL.';
const HTTPS_PATTERN = /^https:\/\//i;
const TRAILING_SLASHES_PATTERN = /\/+$/;

// The access token travels in every request, so a plain http URL is refused
// instead of leaking it. A trailing slash is dropped because paths start with one.
export function getProductRepositorySetup(
  config: HomeConfig
): ProductRepositorySetup {
  const authSetup = getAuthSetup(config);
  if (!('service' in authSetup)) return authSetup;

  if (!config.apiBaseUrl) return { problem: MISSING_CONFIG_PROBLEM };
  if (!HTTPS_PATTERN.test(config.apiBaseUrl)) {
    return { problem: INSECURE_URL_PROBLEM };
  }

  const apiClient = createApiClient({
    baseUrl: config.apiBaseUrl.replace(TRAILING_SLASHES_PATTERN, ''),
    getAccessToken: () => authSetup.service.getAccessToken(),
  });
  return { repository: createApiProductRepository(apiClient) };
}
