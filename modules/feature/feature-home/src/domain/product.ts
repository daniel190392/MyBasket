export type ProductCategory = 'food' | 'drinks' | 'dairy';

export type MeasureUnit = 'g' | 'kg' | 'ml' | 'l';

export type Packaging = 'bottle' | 'box' | 'can' | 'bag' | 'pack';

// What each package holds, for example 1 l.
export interface PackageContent {
  size: number;
  unit: MeasureUnit;
}

export interface Quantity {
  // How many packages there are.
  count: number;
  packaging?: Packaging;
  content?: PackageContent;
}

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

// What the user enters to add a product: the repository assigns the id and a
// new product is never a favorite.
export type ProductDraft = Omit<Product, 'id' | 'isFavorite'>;
