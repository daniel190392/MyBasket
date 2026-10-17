import type { Product } from './product';
import type { QuantityUpdate } from './ProductRepository';

// The edits the user has made in the edit mode and has not saved yet.
export interface EditChanges {
  // The new number of packages, only for products whose number changed.
  counts: Readonly<Record<string, number>>;
  removedIds: readonly string[];
}

export const NO_CHANGES: EditChanges = { counts: {}, removedIds: [] };

export function isRemoved(changes: EditChanges, productId: string): boolean {
  return changes.removedIds.includes(productId);
}

export function isCountChanged(
  changes: EditChanges,
  productId: string
): boolean {
  return productId in changes.counts;
}

export function currentCount(changes: EditChanges, product: Product): number {
  return changes.counts[product.id] ?? product.quantity.count;
}

// A count can reach zero but never goes below it. Going back to the saved
// count is not a change.
export function setCount(
  changes: EditChanges,
  product: Product,
  count: number
): EditChanges {
  const otherCounts = Object.fromEntries(
    Object.entries(changes.counts).filter(
      ([productId]) => productId !== product.id
    )
  );
  const newCount = Math.max(0, Math.floor(count));
  return {
    ...changes,
    counts:
      newCount === product.quantity.count
        ? otherCounts
        : { ...otherCounts, [product.id]: newCount },
  };
}

export function toggleRemoval(
  changes: EditChanges,
  productId: string
): EditChanges {
  return {
    ...changes,
    removedIds: isRemoved(changes, productId)
      ? changes.removedIds.filter((id) => id !== productId)
      : [...changes.removedIds, productId],
  };
}

// A removed product no longer needs its count saved, so it counts once.
export function countChanges(changes: EditChanges): number {
  const changedCounts = Object.keys(changes.counts).filter(
    (productId) => !isRemoved(changes, productId)
  );
  return changedCounts.length + changes.removedIds.length;
}

export function toRequests(changes: EditChanges): {
  updates: QuantityUpdate[];
  removedIds: string[];
} {
  const updates = Object.entries(changes.counts)
    .filter(([productId]) => !isRemoved(changes, productId))
    .map(([productId, count]) => ({ productId, count }));
  return { updates, removedIds: [...changes.removedIds] };
}

// Once the backend has the counts they are no longer pending.
export function withoutCounts(
  changes: EditChanges,
  updates: QuantityUpdate[]
): EditChanges {
  const saved = new Set(updates.map((update) => update.productId));
  return {
    ...changes,
    counts: Object.fromEntries(
      Object.entries(changes.counts).filter(
        ([productId]) => !saved.has(productId)
      )
    ),
  };
}

export function withUpdatedCounts(
  products: Product[],
  updates: QuantityUpdate[]
): Product[] {
  return products.map((product) => {
    const update = updates.find(({ productId }) => productId === product.id);
    return update
      ? { ...product, quantity: { ...product.quantity, count: update.count } }
      : product;
  });
}

export function withoutProducts(
  products: Product[],
  productIds: readonly string[]
): Product[] {
  return products.filter((product) => !productIds.includes(product.id));
}
