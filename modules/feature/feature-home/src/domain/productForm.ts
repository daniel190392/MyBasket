import type {
  MeasureUnit,
  Packaging,
  PackageContent,
  ProductCategory,
  ProductDraft,
} from './product';

// The raw text of the form: validation turns it into a draft.
export interface ProductFormValues {
  name: string;
  category: ProductCategory;
  // How many packages.
  countText: string;
  packaging: Packaging | null;
  // What each package holds: both parts or none.
  contentSizeText: string;
  contentUnit: MeasureUnit | null;
  // Typed as the user reads it: DD/MM/YYYY.
  expirationText: string;
}

export type ProductFormField = 'name' | 'count' | 'content' | 'expirationDate';

export type ProductFormErrors = Partial<Record<ProductFormField, true>>;

export type ProductFormResult =
  | { isValid: true; draft: ProductDraft }
  | { isValid: false; errors: ProductFormErrors };

const DATE_PATTERN = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
const COUNT_PATTERN = /^\d+$/;
const DECIMAL_PATTERN = /^\d+([.,]\d+)?$/;

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

// Packages are whole: 2 bottles, not 1.5. Zero is allowed (it ran out).
export function parseCount(text: string): number | null {
  const trimmed = text.trim();
  return COUNT_PATTERN.test(trimmed) ? Number(trimmed) : null;
}

// Accepts a comma as the decimal separator, as the keyboard offers it.
export function parseContentSize(text: string): number | null {
  const trimmed = text.trim();
  if (!DECIMAL_PATTERN.test(trimmed)) return null;
  const size = Number(trimmed.replace(',', '.'));
  return size > 0 ? size : null;
}

// `undefined` means no content was entered; `null` means it is incomplete or
// invalid, because the backend takes the size and its unit as a pair.
function parseContent(
  sizeText: string,
  unit: MeasureUnit | null
): PackageContent | undefined | null {
  if (sizeText.trim() === '' && unit === null) return undefined;

  const size = parseContentSize(sizeText);
  return size === null || unit === null ? null : { size, unit };
}

export function validateProductForm(
  values: ProductFormValues
): ProductFormResult {
  const name = values.name.trim();
  const count = parseCount(values.countText);
  const content = parseContent(values.contentSizeText, values.contentUnit);
  const expirationDate = parseExpirationDate(values.expirationText);

  const errors: ProductFormErrors = {
    ...(name === '' && { name: true }),
    ...(count === null && { count: true }),
    ...(content === null && { content: true }),
    ...(expirationDate === null && { expirationDate: true }),
  };

  if (
    name === '' ||
    count === null ||
    content === null ||
    expirationDate === null
  ) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    draft: {
      name,
      category: values.category,
      quantity: {
        count,
        ...(values.packaging && { packaging: values.packaging }),
        ...(content && { content }),
      },
      expirationDate,
    },
  };
}
