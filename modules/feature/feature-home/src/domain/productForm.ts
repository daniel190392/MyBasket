import type { MeasureUnit, ProductCategory, ProductDraft } from './product';

export const UNITS_OPTION = 'units';

export type QuantityUnitOption = typeof UNITS_OPTION | MeasureUnit;

// The raw text of the form: validation turns it into a draft.
export interface ProductFormValues {
  name: string;
  category: ProductCategory;
  quantityText: string;
  quantityUnit: QuantityUnitOption;
  // Typed as the user reads it: DD/MM/YYYY.
  expirationText: string;
}

export type ProductFormField = 'name' | 'quantity' | 'expirationDate';

export type ProductFormErrors = Partial<Record<ProductFormField, true>>;

export type ProductFormResult =
  | { isValid: true; draft: ProductDraft }
  | { isValid: false; errors: ProductFormErrors };

const DATE_PATTERN = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
const QUANTITY_PATTERN = /^\d+([.,]\d+)?$/;

function pad(value: number, length: number): string {
  return String(value).padStart(length, '0');
}

// Returns the date as `YYYY-MM-DD`, or null when the text is not a real day
// (31/02/2026 is rejected, not rolled over to March).
export function parseExpirationDate(text: string): string | null {
  const match = DATE_PATTERN.exec(text.trim());
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  const isRealDay =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;

  return isRealDay ? `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}` : null;
}

// Accepts a comma as the decimal separator, as the keyboard offers it.
export function parseQuantity(text: string): number | null {
  const trimmed = text.trim();
  if (!QUANTITY_PATTERN.test(trimmed)) return null;
  return Number(trimmed.replace(',', '.'));
}

export function validateProductForm(
  values: ProductFormValues
): ProductFormResult {
  const name = values.name.trim();
  const amount = parseQuantity(values.quantityText);
  const expirationDate = parseExpirationDate(values.expirationText);

  const errors: ProductFormErrors = {
    ...(name === '' && { name: true }),
    ...(amount === null && { quantity: true }),
    ...(expirationDate === null && { expirationDate: true }),
  };

  if (amount === null || expirationDate === null || name === '') {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    draft: {
      name,
      category: values.category,
      quantity:
        values.quantityUnit === UNITS_OPTION
          ? { kind: 'units', count: amount }
          : { kind: 'measure', amount, unit: values.quantityUnit },
      expirationDate,
    },
  };
}
