import type { MeasureUnit, ProductCategory } from '../domain/product';
import type { QuantityUnitOption } from '../domain/productForm';

const MEASURE_UNIT_LABELS: Record<
  MeasureUnit,
  { singular: string; plural: string }
> = {
  g: { singular: 'g', plural: 'g' },
  kg: { singular: 'kg', plural: 'kg' },
  ml: { singular: 'ml', plural: 'ml' },
  l: { singular: 'litro', plural: 'litros' },
};

export const homeStrings = {
  productsTab: 'Productos',
  favoritesTab: 'Favoritos',
  addProductTitle: 'Añadir producto',
  placeholderCaption: 'Screen under construction',
  productsTitle: 'Mi Despensa',
  searchPlaceholder: 'Buscar producto',
  filterButtonLabel: 'Filtrar',
  allCategories: 'Todos',
  expiringSoonSection: 'Por caducar',
  restSection: 'Resto de la despensa',
  addProductButton: 'Añadir',
  addFavoriteLabel: 'Marcar como favorito',
  removeFavoriteLabel: 'Quitar de favoritos',
  noResults: 'No hay productos que coincidan',
  loadError: 'No se pudieron cargar los productos',
  retry: 'Reintentar',
} as const;

export const addProductStrings = {
  categoryLabel: 'Categoría',
  nameLabel: 'Nombre del producto',
  namePlaceholder: 'Ej. Arroz integral',
  nameError: 'Escribe el nombre del producto',
  quantityLabel: 'Cantidad',
  quantityPlaceholder: 'Ej. 2',
  quantityError: 'Escribe un número mayor o igual que 0',
  unitLabel: 'Unidad',
  expirationLabel: 'Fecha de caducidad',
  expirationPlaceholder: 'DD/MM/AAAA',
  expirationError: 'Escribe una fecha válida',
  submit: 'Añadir a la despensa',
  submitError: 'No se pudo añadir el producto. Inténtalo de nuevo.',
} as const;

export const quantityUnitLabels: Record<QuantityUnitOption, string> = {
  units: 'Unidades',
  g: 'g',
  kg: 'kg',
  ml: 'ml',
  l: 'l',
};

export const categoryLabels: Record<ProductCategory, string> = {
  food: 'Alimentos',
  drinks: 'Bebidas',
  dairy: 'Lácteos',
};

export function productCountLabel(count: number): string {
  return count === 1 ? '1 producto' : `${count} productos`;
}

export function unitsLabel(count: number): string {
  return count === 1 ? '1 unidad' : `${count} unidades`;
}

export function measureLabel(amount: number, unit: MeasureUnit): string {
  const labels = MEASURE_UNIT_LABELS[unit];
  return `${amount} ${amount === 1 ? labels.singular : labels.plural}`;
}

export const expirationLabels = {
  expired: 'Caducado',
  today: 'Caduca hoy',
  tomorrow: 'Caduca mañana',
  inDays: (days: number) => `Caduca en ${days} días`,
  inMonths: (months: number) =>
    `Caduca en ${months} ${months === 1 ? 'mes' : 'meses'}`,
};
