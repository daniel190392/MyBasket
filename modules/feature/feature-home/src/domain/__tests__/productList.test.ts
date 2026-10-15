import { filterProducts, groupByExpiration } from '../productList';
import { buildProduct, NOW } from './fixtures';

const yogurt = buildProduct({ id: 'yogurt', expirationDate: '2026-10-16' });
const chicken = buildProduct({
  id: 'chicken',
  name: 'Pollo fresco',
  category: 'food',
  expirationDate: '2026-10-18',
});
const milk = buildProduct({
  id: 'milk',
  name: 'Leche entera',
  category: 'drinks',
  expirationDate: '2026-10-27',
});
const pasta = buildProduct({
  id: 'pasta',
  name: 'Pasta integral',
  category: 'food',
  expirationDate: '2027-08-15',
});
const products = [pasta, milk, chicken, yogurt];

const ids = (list: { id: string }[]) => list.map((product) => product.id);

describe('filterProducts', () => {
  it('returns everything without a query or category', () => {
    expect(
      filterProducts(products, { query: '', category: null })
    ).toHaveLength(4);
  });

  it('filters by category', () => {
    const result = filterProducts(products, { query: '', category: 'food' });

    expect(ids(result)).toEqual(['pasta', 'chicken']);
  });

  it('ignores case and surrounding spaces in the query', () => {
    const result = filterProducts(products, {
      query: '  LECHE ',
      category: null,
    });

    expect(ids(result)).toEqual(['milk']);
  });

  it('matches accent-free queries against accented names', () => {
    const accented = buildProduct({ id: 'coffee', name: 'Café molido' });

    expect(
      ids(filterProducts([accented], { query: 'cafe', category: null }))
    ).toEqual(['coffee']);
  });

  it('combines category and query', () => {
    const result = filterProducts(products, {
      query: 'pasta',
      category: 'food',
    });

    expect(ids(result)).toEqual(['pasta']);
  });
});

describe('groupByExpiration', () => {
  it('splits expiring soon from the rest, each sorted by date', () => {
    const groups = groupByExpiration(products, NOW);

    expect(ids(groups.expiringSoon)).toEqual(['yogurt', 'chicken']);
    expect(ids(groups.rest)).toEqual(['milk', 'pasta']);
  });

  it('keeps expired products in the expiring soon group', () => {
    const expired = buildProduct({
      id: 'expired',
      expirationDate: '2026-10-10',
    });

    expect(ids(groupByExpiration([milk, expired], NOW).expiringSoon)).toEqual([
      'expired',
    ]);
  });

  it('does not mutate the input', () => {
    const input = [pasta, yogurt];

    groupByExpiration(input, NOW);

    expect(ids(input)).toEqual(['pasta', 'yogurt']);
  });
});
