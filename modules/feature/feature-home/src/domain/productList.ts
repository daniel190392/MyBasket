import { expirationStatus } from './expiration';

import type { Product, ProductCategory } from './product';
import type { ProductListRequest } from './ProductRepository';

export interface ProductFilter {
  query: string;
  // `null` means every category.
  category: ProductCategory | null;
}

export const NO_FILTER: ProductFilter = { query: '', category: null };

export interface ProductGroups {
  expiringSoon: Product[];
  rest: Product[];
}

const COMBINING_MARKS = /[̀-ͯ]/g;

// Lowercase and accent-free, so "lacteos" finds "Lácteos".
function normalizeText(text: string): string {
  return text.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase();
}

export function isFilterActive(filter: ProductFilter): boolean {
  return filter.query.trim() !== '' || filter.category !== null;
}

// The first page of a filter; the cursor is added to ask for the next ones.
export function toListRequest(
  filter: ProductFilter,
  cursor?: string
): ProductListRequest {
  return {
    cursor,
    query: filter.query.trim() || undefined,
    category: filter.category ?? undefined,
  };
}

// The backend can repeat a product that moved between two requests.
export function appendPage(current: Product[], incoming: Product[]): Product[] {
  const knownIds = new Set(current.map((product) => product.id));
  return [
    ...current,
    ...incoming.filter((product) => !knownIds.has(product.id)),
  ];
}

export function filterProducts(
  products: Product[],
  filter: ProductFilter
): Product[] {
  const query = normalizeText(filter.query.trim());

  return products.filter((product) => {
    const matchesCategory =
      filter.category === null || product.category === filter.category;
    const matchesQuery = normalizeText(product.name).includes(query);
    return matchesCategory && matchesQuery;
  });
}

// Each group is sorted by expiration date, the closest first. Expired
// products stay in the first group: they are the most urgent.
export function groupByExpiration(
  products: Product[],
  now: Date
): ProductGroups {
  const sorted = [...products].sort((first, second) =>
    first.expirationDate.localeCompare(second.expirationDate)
  );
  const isExpiringSoon = (product: Product) => {
    const { level } = expirationStatus(product, now);
    return level === 'expired' || level === 'soon';
  };

  return {
    expiringSoon: sorted.filter(isExpiringSoon),
    rest: sorted.filter((product) => !isExpiringSoon(product)),
  };
}
