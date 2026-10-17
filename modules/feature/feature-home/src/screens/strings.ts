import type {
  MeasureUnit,
  Packaging,
  ProductCategory,
} from '../domain/product';
import type { ProductErrorCode } from '../domain/ProductRepositoryError';

export const homeStrings = {
  productsTab: 'Productos',
  favoritesTab: 'Favoritos',
  addProductTitle: 'Añadir producto',
  placeholderCaption: 'Screen under construction',
  productsTitle: 'Mi Despensa',
  searchPlaceholder: 'Buscar producto',
  menuButtonLabel: 'Abrir menú',
  allCategories: 'Todos',
  expiringSoonSection: 'Por caducar',
  restSection: 'Resto de la despensa',
  addProductButton: 'Añadir',
  addFavoriteLabel: 'Marcar como favorito',
  removeFavoriteLabel: 'Quitar de favoritos',
  noResults: 'No hay productos que coincidan',
  emptyPantryTitle: 'Tu despensa está vacía',
  emptyPantryCaption: 'Añade tu primer producto para controlar su caducidad',
  addFirstProductButton: 'Añadir producto',
  refreshError: 'No se pudo actualizar. Desliza hacia abajo para reintentar.',
  loadError: 'No se pudieron cargar los productos',
  retry: 'Reintentar',
} as const;

export const addProductStrings = {
  categoryLabel: 'Categoría',
  nameLabel: 'Nombre del producto *',
  namePlaceholder: 'Ej. Arroz integral',
  nameError: 'Escribe el nombre del producto',
  countLabel: 'Cantidad *',
  countPlaceholder: 'Ej. 2',
  countError: 'Escribe un número entero mayor o igual que 0',
  packagingLabel: 'Envase',
  contentLabel: 'Contenido de cada envase',
  contentPlaceholder: 'Ej. 1',
  contentError: 'Indica el contenido y su unidad, o deja ambos vacíos',
  expirationLabel: 'Fecha de caducidad *',
  expirationPlaceholder: 'DD/MM/AAAA',
  expirationError: 'Escribe una fecha válida',
  submit: 'Añadir a la despensa',
  requiredFieldsNote: 'Campos obligatorios marcados con *',
  submitError: 'No se pudo añadir el producto. Inténtalo de nuevo.',
} as const;

// What the user can do about each cause is the same whatever failed.
const connectionErrorMessages: Record<
  Exclude<ProductErrorCode, 'unknown'>,
  string
> = {
  offline: 'Sin conexión. Revisa tu internet e inténtalo de nuevo.',
  server: 'El servidor no responde. Inténtalo de nuevo en unos minutos.',
  unauthorized: 'Tu sesión ya no es válida. Cierra sesión y vuelve a entrar.',
};

export function loadErrorMessage(code: ProductErrorCode): string {
  return code === 'unknown'
    ? homeStrings.loadError
    : connectionErrorMessages[code];
}

export function addErrorMessage(code: ProductErrorCode): string {
  return code === 'unknown'
    ? addProductStrings.submitError
    : connectionErrorMessages[code];
}

export const editProductsStrings = {
  moreOptionsLabel: 'Más opciones',
  editMenuItem: 'Editar despensa',
  title: 'Editar despensa',
  undoRemoval: 'Deshacer',
  willBeRemoved: 'Se eliminará al guardar',
  discardTitle: '¿Descartar los cambios?',
  discardMessage: 'Los cambios sin guardar se perderán.',
  keepEditing: 'Seguir editando',
  discard: 'Descartar',
  saveError: 'No se pudieron guardar los cambios. Inténtalo de nuevo.',
  save: (changeCount: number) => `Guardar cambios (${changeCount})`,
  decreaseLabel: (name: string) => `Disminuir la cantidad de ${name}`,
  increaseLabel: (name: string) => `Aumentar la cantidad de ${name}`,
  removeLabel: (name: string) => `Eliminar ${name}`,
};

export function saveErrorMessage(code: ProductErrorCode): string {
  return code === 'unknown'
    ? editProductsStrings.saveError
    : connectionErrorMessages[code];
}

export const contentUnitLabels: Record<MeasureUnit, string> = {
  g: 'g',
  kg: 'kg',
  ml: 'ml',
  l: 'l',
};

export const packagingLabels: Record<
  Packaging,
  { chip: string; singular: string; plural: string }
> = {
  bottle: { chip: 'Botella', singular: 'botella', plural: 'botellas' },
  box: { chip: 'Caja', singular: 'caja', plural: 'cajas' },
  can: { chip: 'Lata', singular: 'lata', plural: 'latas' },
  bag: { chip: 'Bolsa', singular: 'bolsa', plural: 'bolsas' },
  pack: { chip: 'Paquete', singular: 'paquete', plural: 'paquetes' },
};

export const categoryLabels: Record<ProductCategory, string> = {
  food: 'Alimentos',
  drinks: 'Bebidas',
  dairy: 'Lácteos',
};

export function productCountLabel(count: number): string {
  return count === 1 ? '1 producto' : `${count} productos`;
}

export function unitsWord(count: number): string {
  return count === 1 ? 'unidad' : 'unidades';
}

export function packagingWord(count: number, packaging: Packaging): string {
  const labels = packagingLabels[packaging];
  return count === 1 ? labels.singular : labels.plural;
}

export const expirationLabels = {
  expired: 'Caducado',
  today: 'Caduca hoy',
  tomorrow: 'Caduca mañana',
  inDays: (days: number) => `Caduca en ${days} días`,
  inMonths: (months: number) =>
    `Caduca en ${months} ${months === 1 ? 'mes' : 'meses'}`,
};
