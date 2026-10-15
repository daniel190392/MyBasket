import type { Product } from '../product';

export const NOW = new Date(2026, 9, 15, 18, 30);

export function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'product-1',
    name: 'Yogur natural',
    category: 'dairy',
    quantity: { kind: 'units', count: 4 },
    expirationDate: '2026-10-16',
    isFavorite: false,
    ...overrides,
  };
}
