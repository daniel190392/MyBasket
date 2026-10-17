import { useState } from 'react';

import { validateProductForm } from '../domain/productForm';
import { useProducts } from '../state/ProductsProvider';

import type {
  ProductFormErrors,
  ProductFormValues,
} from '../domain/productForm';

const INITIAL_VALUES: ProductFormValues = {
  name: '',
  category: 'food',
  countText: '',
  packaging: null,
  contentSizeText: '',
  contentUnit: null,
  expirationText: '',
};

export function useAddProductForm(onProductAdded: () => void) {
  const { addProduct } = useProducts();
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitFailed, setHasSubmitFailed] = useState(false);

  const setValue = <Field extends keyof ProductFormValues>(
    field: Field,
    value: ProductFormValues[Field]
  ) => setValues((current) => ({ ...current, [field]: value }));

  const submit = async () => {
    const result = validateProductForm(values);
    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    setHasSubmitFailed(false);
    setIsSubmitting(true);
    try {
      await addProduct(result.draft);
      onProductAdded();
    } catch {
      setHasSubmitFailed(true);
      setIsSubmitting(false);
    }
  };

  return { values, errors, isSubmitting, hasSubmitFailed, setValue, submit };
}
