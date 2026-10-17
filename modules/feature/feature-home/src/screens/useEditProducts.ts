import { useState } from 'react';

import {
  NO_CHANGES,
  countChanges,
  setCount,
  toRequests,
  toggleRemoval,
  withoutCounts,
} from '../domain/editChanges';
import { productErrorCode } from '../domain/ProductRepositoryError';
import { useProducts } from '../state/ProductsProvider';

import type { Product } from '../domain/product';
import type { ProductErrorCode } from '../domain/ProductRepositoryError';

export function useEditProducts() {
  const { updateQuantities, removeProducts } = useProducts();
  const [changes, setChanges] = useState(NO_CHANGES);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveErrorCode, setSaveErrorCode] = useState<ProductErrorCode | null>(
    null
  );

  const changeCount = countChanges(changes);

  const changeProductCount = (product: Product, count: number) =>
    setChanges((current) => setCount(current, product, count));

  const toggleProductRemoval = (productId: string) =>
    setChanges((current) => toggleRemoval(current, productId));

  // The backend takes the counts and the removals in two calls, each of them
  // all-or-nothing. What the first call saved stops being pending, so after a
  // failure in the second one a retry only sends what is left.
  const save = async () => {
    setSaveErrorCode(null);
    setIsSaving(true);
    try {
      const { updates, removedIds } = toRequests(changes);
      if (updates.length > 0) {
        await updateQuantities(updates);
        setChanges((current) => withoutCounts(current, updates));
      }
      if (removedIds.length > 0) {
        await removeProducts(removedIds);
      }
      setChanges(NO_CHANGES);
      setIsSaved(true);
    } catch (error) {
      setSaveErrorCode(productErrorCode(error));
    } finally {
      setIsSaving(false);
    }
  };

  return {
    changes,
    changeCount,
    isSaving,
    isSaved,
    saveErrorCode,
    changeProductCount,
    toggleProductRemoval,
    save,
  };
}
