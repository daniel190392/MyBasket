import type { Product, ProductDraft } from './product';

export interface ProductRepository {
  list(): Promise<Product[]>;
  create(draft: ProductDraft): Promise<Product>;
  setFavorite(productId: string, isFavorite: boolean): Promise<void>;
}
