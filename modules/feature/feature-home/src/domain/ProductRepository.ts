import type { Product } from './product';

export interface ProductRepository {
  list(): Promise<Product[]>;
  setFavorite(productId: string, isFavorite: boolean): Promise<void>;
}
