import type { Product, ProductRepository } from 'feature-home';

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

function isoDateInDays(days: number): string {
  const date = new Date(Date.now() + days * DAY_IN_MILLISECONDS);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

// Temporary adapter until the persistence of the products is decided: it keeps
// a fake sample in memory so the home can be seen running inside the host.
export function createTemporaryProductRepository(): ProductRepository {
  let products: Product[] = [
    {
      id: 'sample-yogurt',
      name: 'Yogur natural',
      category: 'dairy',
      quantity: { kind: 'units', count: 4 },
      expirationDate: isoDateInDays(1),
      isFavorite: true,
    },
    {
      id: 'sample-chicken',
      name: 'Pollo fresco',
      category: 'food',
      quantity: { kind: 'measure', amount: 1, unit: 'kg' },
      expirationDate: isoDateInDays(3),
      isFavorite: false,
    },
    {
      id: 'sample-milk',
      name: 'Leche entera',
      category: 'drinks',
      quantity: { kind: 'measure', amount: 2, unit: 'l' },
      expirationDate: isoDateInDays(12),
      isFavorite: true,
    },
  ];

  return {
    list: async () => products,
    setFavorite: async (productId, isFavorite) => {
      products = products.map((product) =>
        product.id === productId ? { ...product, isFavorite } : product
      );
    },
  };
}
