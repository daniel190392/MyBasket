import type { Product, ProductDraft } from './product';

export interface QuantityUpdate {
  productId: string;
  // The new number of packages.
  count: number;
}

export interface ProductRepository {
  list(): Promise<Product[]>;
  create(draft: ProductDraft): Promise<Product>;
  // All-or-nothing: either every update is saved or none is.
  updateQuantities(updates: QuantityUpdate[]): Promise<void>;
  // All-or-nothing: either every product is removed or none is.
  remove(productIds: string[]): Promise<void>;
  setFavorite(productId: string, isFavorite: boolean): Promise<void>;
}
