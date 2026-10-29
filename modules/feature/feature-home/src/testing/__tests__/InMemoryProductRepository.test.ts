import { buildProduct } from '../../domain/__tests__/fixtures';
import { InMemoryProductRepository } from '../InMemoryProductRepository';

const products = [
  buildProduct({ id: 'c', name: 'Café', expirationDate: '2026-12-03' }),
  buildProduct({ id: 'a', name: 'Arroz', category: 'food' }),
  buildProduct({ id: 'b', name: 'Bebida', expirationDate: '2026-11-02' }),
];

const createRepository = (pageSize: number) =>
  new InMemoryProductRepository({ products, delayMs: 0, pageSize });

const ids = (page: { products: { id: string }[] }) =>
  page.products.map((product) => product.id);

describe('InMemoryProductRepository.list', () => {
  it('returns pages sorted by expiration date, linked by the cursor', async () => {
    const repository = createRepository(2);

    const first = await repository.list();
    const second = await repository.list({
      cursor: first.nextCursor ?? undefined,
    });

    expect(ids(first)).toEqual(['a', 'b']);
    expect(first.nextCursor).not.toBeNull();
    expect(ids(second)).toEqual(['c']);
    expect(second.nextCursor).toBeNull();
  });

  it('filters by query and category before paginating', async () => {
    const repository = createRepository(2);

    expect(ids(await repository.list({ query: 'cafe' }))).toEqual(['c']);
    expect(ids(await repository.list({ category: 'food' }))).toEqual(['a']);
  });
});
