export type ProductCategory = 'food' | 'drinks' | 'dairy';

export type MeasureUnit = 'g' | 'kg' | 'ml' | 'l';

export type Quantity =
  | { kind: 'units'; count: number }
  | { kind: 'measure'; amount: number; unit: MeasureUnit };

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  quantity: Quantity;
  // Calendar date as `YYYY-MM-DD`, with no time zone: an expiration date is a
  // day printed on the package, not an instant.
  expirationDate: string;
  isFavorite: boolean;
}
