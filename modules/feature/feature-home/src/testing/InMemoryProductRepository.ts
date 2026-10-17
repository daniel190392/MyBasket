import type { Product, ProductDraft } from '../domain/product';
import { withUpdatedCounts, withoutProducts } from '../domain/editChanges';

import type {
  ProductRepository,
  QuantityUpdate,
} from '../domain/ProductRepository';

const SAMPLE_DELAY_MS = 300;

function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function daysFrom(today: Date, days: number): string {
  return toIsoDate(
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + days)
  );
}

// Dates are relative to `today` so the sample keeps showing every expiration
// level no matter when the example runs.
export function createSampleProducts(today: Date): Product[] {
  return [
    {
      id: 'sample-yogurt',
      name: 'Yogur natural',
      category: 'dairy',
      quantity: { count: 4, packaging: 'pack' },
      expirationDate: daysFrom(today, 1),
      isFavorite: true,
    },
    {
      id: 'sample-chicken',
      name: 'Pollo fresco',
      category: 'food',
      quantity: { count: 1, content: { size: 1, unit: 'kg' } },
      expirationDate: daysFrom(today, 3),
      isFavorite: false,
    },
    {
      id: 'sample-milk',
      name: 'Leche entera',
      category: 'drinks',
      quantity: {
        count: 2,
        packaging: 'bottle',
        content: { size: 1, unit: 'l' },
      },
      expirationDate: daysFrom(today, 12),
      isFavorite: true,
    },
    {
      id: 'sample-pasta',
      name: 'Pasta integral',
      category: 'food',
      quantity: {
        count: 1,
        packaging: 'bag',
        content: { size: 500, unit: 'g' },
      },
      expirationDate: daysFrom(today, 300),
      isFavorite: true,
    },
  ];
}

interface InMemoryProductRepositoryOptions {
  products?: Product[];
  delayMs?: number;
}

export class InMemoryProductRepository implements ProductRepository {
  private products: Product[];
  private readonly delayMs: number;
  private createdCount = 0;

  constructor({
    products = createSampleProducts(new Date()),
    delayMs = SAMPLE_DELAY_MS,
  }: InMemoryProductRepositoryOptions = {}) {
    this.products = products;
    this.delayMs = delayMs;
  }

  async list(): Promise<Product[]> {
    await this.simulateLatency();
    return this.products;
  }

  async create(draft: ProductDraft): Promise<Product> {
    await this.simulateLatency();
    this.createdCount += 1;
    const product: Product = {
      ...draft,
      id: `created-${this.createdCount}`,
      isFavorite: false,
    };
    this.products = [...this.products, product];
    return product;
  }

  async updateQuantities(updates: QuantityUpdate[]): Promise<void> {
    await this.simulateLatency();
    this.products = withUpdatedCounts(this.products, updates);
  }

  async remove(productIds: string[]): Promise<void> {
    await this.simulateLatency();
    this.products = withoutProducts(this.products, productIds);
  }

  async setFavorite(productId: string, isFavorite: boolean): Promise<void> {
    await this.simulateLatency();
    this.products = this.products.map((product) =>
      product.id === productId ? { ...product, isFavorite } : product
    );
  }

  private simulateLatency(): Promise<void> {
    if (this.delayMs === 0) return Promise.resolve();
    return new Promise((resolve) => setTimeout(resolve, this.delayMs));
  }
}
