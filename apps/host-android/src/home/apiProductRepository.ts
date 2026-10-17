import type { ApiClient } from 'api-client';
import type { ProductRepository } from 'feature-home';

import { toProduct } from './productMapping';

import type { BackendProduct } from './productMapping';

const PRODUCTS_PATH = '/products';

type ProductsResponse = {
  products: BackendProduct[];
};

export function createApiProductRepository(
  apiClient: ApiClient
): ProductRepository {
  return {
    list: async () => {
      const { products } =
        await apiClient.request<ProductsResponse>(PRODUCTS_PATH);
      return products.map(toProduct);
    },
    // Rejecting makes the home put the star back: the backend cannot store it.
    setFavorite: async () => {
      throw new Error('The backend does not support favorites yet');
    },
  };
}
