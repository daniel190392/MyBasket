import { useState } from 'react';

import { validateProductForm } from '../domain/productForm';
import { productErrorCode } from '../domain/ProductRepositoryError';
import { useProducts } from '../state/ProductsProvider';

import type { ProductErrorCode } from '../domain/ProductRepositoryError';
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
  const [submitErrorCode, setSubmitErrorCode] =
    useState<ProductErrorCode | null>(null);

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
    setSubmitErrorCode(null);
    setIsSubmitting(true);
    try {
      await addProduct(result.draft);
      onProductAdded();
    } catch (error) {
      setSubmitErrorCode(productErrorCode(error));
      setIsSubmitting(false);
    }
  };

  return { values, errors, isSubmitting, submitErrorCode, setValue, submit };
}
