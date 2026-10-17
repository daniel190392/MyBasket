import type { Product } from 'feature-home';

// The product as the backend sends it. `unit` and `category` are free text
// there, while the home works with closed sets.
export type BackendProduct = {
  productId: string;
  name: string;
  quantity: number;
  expirationDate: string;
  unit?: string;
  category?: string;
};

type Category = Product['category'];
type Quantity = Product['quantity'];
type MeasureUnit = Extract<Quantity, { kind: 'measure' }>['unit'];

const CATEGORIES: readonly Category[] = ['food', 'drinks', 'dairy'];
const MEASURE_UNITS: readonly MeasureUnit[] = ['g', 'kg', 'ml', 'l'];
const FALLBACK_CATEGORY: Category = 'food';

function toCategory(category: string | undefined): Category {
  const normalized = category?.trim().toLowerCase();
  return CATEGORIES.find((known) => known === normalized) ?? FALLBACK_CATEGORY;
}

// Any unit that is not a measure ("units", "box", none) is a plain count.
function toQuantity(amount: number, unit: string | undefined): Quantity {
  const normalized = unit?.trim().toLowerCase();
  const measureUnit = MEASURE_UNITS.find((known) => known === normalized);
  return measureUnit
    ? { kind: 'measure', amount, unit: measureUnit }
    : { kind: 'units', count: amount };
}

// The backend has no favorites yet, so no product comes back as one.
export function toProduct(backendProduct: BackendProduct): Product {
  return {
    id: backendProduct.productId,
    name: backendProduct.name,
    category: toCategory(backendProduct.category),
    quantity: toQuantity(backendProduct.quantity, backendProduct.unit),
    expirationDate: backendProduct.expirationDate,
    isFavorite: false,
  };
}
