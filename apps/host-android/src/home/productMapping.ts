import type { Product, ProductDraft } from 'feature-home';

// The product as the backend sends it. `packaging`, `category` and
// `sizeUnit` are free text there, while the home works with closed sets.
export type BackendProduct = {
  productId: string;
  name: string;
  quantity: number;
  expirationDate: string;
  packaging?: string;
  size?: number;
  sizeUnit?: string;
  category?: string;
};

type Category = Product['category'];
type Quantity = Product['quantity'];
type Packaging = NonNullable<Quantity['packaging']>;
type Content = NonNullable<Quantity['content']>;

const CATEGORIES: readonly Category[] = ['food', 'drinks', 'dairy'];
const PACKAGINGS: readonly Packaging[] = [
  'bottle',
  'box',
  'can',
  'bag',
  'pack',
];
const CONTENT_UNITS: readonly Content['unit'][] = ['g', 'kg', 'ml', 'l'];
const FALLBACK_CATEGORY: Category = 'food';

function normalize(text: string | undefined): string | undefined {
  return text?.trim().toLowerCase();
}

function toCategory(category: string | undefined): Category {
  const normalized = normalize(category);
  return CATEGORIES.find((known) => known === normalized) ?? FALLBACK_CATEGORY;
}

function toPackaging(packaging: string | undefined): Packaging | undefined {
  const normalized = normalize(packaging);
  return PACKAGINGS.find((known) => known === normalized);
}

// The size and its unit only make sense together: if the unit is not one the
// home knows, the size is dropped too instead of showing a wrong measure.
function toContent(
  size: number | undefined,
  sizeUnit: string | undefined
): Content | undefined {
  const normalized = normalize(sizeUnit);
  const unit = CONTENT_UNITS.find((known) => known === normalized);
  return size !== undefined && unit ? { size, unit } : undefined;
}

function toQuantity(backendProduct: BackendProduct): Quantity {
  const packaging = toPackaging(backendProduct.packaging);
  const content = toContent(backendProduct.size, backendProduct.sizeUnit);
  return {
    count: backendProduct.quantity,
    ...(packaging && { packaging }),
    ...(content && { content }),
  };
}

// What the backend takes to create a product.
export type BackendProductDraft = Omit<BackendProduct, 'productId'>;

export function toBackendDraft(draft: ProductDraft): BackendProductDraft {
  const { count, packaging, content } = draft.quantity;
  return {
    name: draft.name,
    category: draft.category,
    expirationDate: draft.expirationDate,
    quantity: count,
    ...(packaging && { packaging }),
    ...(content && { size: content.size, sizeUnit: content.unit }),
  };
}

// The backend has no favorites yet, so no product comes back as one.
export function toProduct(backendProduct: BackendProduct): Product {
  return {
    id: backendProduct.productId,
    name: backendProduct.name,
    category: toCategory(backendProduct.category),
    quantity: toQuantity(backendProduct),
    expirationDate: backendProduct.expirationDate,
    isFavorite: false,
  };
}
