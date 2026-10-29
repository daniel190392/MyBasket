import type { Product, ProductCategory, ProductDraft } from './product';

export interface QuantityUpdate {
  productId: string;
  // The new number of packages.
  count: number;
}

export interface ProductListRequest {
  // Opaque: the one a page returned, sent back untouched for the next page.
  cursor?: string;
  query?: string;
  category?: ProductCategory;
}

export interface ProductPage {
  products: Product[];
  // `null` is the only sign that there are no more pages: a page can hold
  // fewer products than the page size and still have a next one.
  nextCursor: string | null;
}

export interface ProductRepository {
  // Products come sorted by expiration date, the closest first, across pages.
  // Changing the query or the category means starting again without a cursor.
  list(request?: ProductListRequest): Promise<ProductPage>;
  create(draft: ProductDraft): Promise<Product>;
  // All-or-nothing: either every update is saved or none is.
  updateQuantities(updates: QuantityUpdate[]): Promise<void>;
  // All-or-nothing: either every product is removed or none is.
  remove(productIds: string[]): Promise<void>;
  setFavorite(productId: string, isFavorite: boolean): Promise<void>;
}
