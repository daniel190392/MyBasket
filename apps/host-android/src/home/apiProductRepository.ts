import { isApiError } from 'api-client';

import { toBackendDraft, toProduct } from './productMapping';

import type { ApiClient, ApiErrorCode } from 'api-client';
import type {
  ProductErrorCode,
  ProductRepository,
  ProductRepositoryError,
} from 'feature-home';
import type { BackendProduct } from './productMapping';

const PRODUCTS_PATH = '/products';

type ProductsResponse = {
  products: BackendProduct[];
};

// The home explains three causes; any other failure is just "unknown".
const ERROR_CODES: Partial<Record<ApiErrorCode, ProductErrorCode>> = {
  network: 'offline',
  unauthorized: 'unauthorized',
  server: 'server',
};

function toRepositoryError(error: unknown): ProductRepositoryError {
  const code = (isApiError(error) && ERROR_CODES[error.code]) || 'unknown';
  return Object.assign(new Error(code), { code });
}

async function translatingErrors<Result>(
  call: () => Promise<Result>
): Promise<Result> {
  try {
    return await call();
  } catch (error) {
    throw toRepositoryError(error);
  }
}

export function createApiProductRepository(
  apiClient: ApiClient
): ProductRepository {
  return {
    list: () =>
      translatingErrors(async () => {
        const { products } =
          await apiClient.request<ProductsResponse>(PRODUCTS_PATH);
        return products.map(toProduct);
      }),
    create: (draft) =>
      translatingErrors(async () => {
        const backendProduct = await apiClient.request<BackendProduct>(
          PRODUCTS_PATH,
          { method: 'POST', body: toBackendDraft(draft) }
        );
        return toProduct(backendProduct);
      }),
    // Rejecting makes the home put the star back: the backend cannot store it.
    setFavorite: async () => {
      throw new Error('The backend does not support favorites yet');
    },
  };
}
