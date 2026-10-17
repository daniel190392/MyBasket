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
const BATCH_DELETE_PATH = '/products/batch-delete';
// The most entries the backend takes in one bulk call.
const BULK_LIMIT = 25;

type ProductsResponse = {
  products: BackendProduct[];
};

// The home explains three causes; any other failure is just "unknown".
const ERROR_CODES: Partial<Record<ApiErrorCode, ProductErrorCode>> = {
  network: 'offline',
  unauthorized: 'unauthorized',
  server: 'server',
};

function inGroups<Item>(items: Item[], size: number): Item[][] {
  const groups: Item[][] = [];
  for (let start = 0; start < items.length; start += size) {
    groups.push(items.slice(start, start + size));
  }
  return groups;
}

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
    // Each bulk call is all-or-nothing; only more than 25 entries need several.
    updateQuantities: (updates) =>
      translatingErrors(async () => {
        for (const group of inGroups(updates, BULK_LIMIT)) {
          await apiClient.request(PRODUCTS_PATH, {
            method: 'PATCH',
            body: {
              products: group.map(({ productId, count }) => ({
                productId,
                quantity: count,
              })),
            },
          });
        }
      }),
    remove: (productIds) =>
      translatingErrors(async () => {
        for (const group of inGroups(productIds, BULK_LIMIT)) {
          await apiClient.request(BATCH_DELETE_PATH, {
            method: 'POST',
            body: { productIds: group },
          });
        }
      }),
    // Rejecting makes the home put the star back: the backend cannot store it.
    setFavorite: async () => {
      throw new Error('The backend does not support favorites yet');
    },
  };
}
