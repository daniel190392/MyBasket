import { ApiError } from 'api-client';

import { createApiProductRepository } from '../apiProductRepository';

import type { ApiClient } from 'api-client';

const errorWithCode = (code: string) => expect.objectContaining({ code });

const createApiClientReturning = (response: unknown) => {
  const request = jest.fn().mockResolvedValue(response);
  return { apiClient: { request } as ApiClient, request };
};

describe('createApiProductRepository', () => {
  it('lists the products of the backend response', async () => {
    const { apiClient, request } = createApiClientReturning({
      products: [
        {
          productId: 'a1',
          name: 'Milk',
          quantity: 2,
          packaging: 'bottle',
          size: 1,
          sizeUnit: 'L',
          category: 'dairy',
          expirationDate: '2026-12-01',
        },
      ],
    });

    const products = await createApiProductRepository(apiClient).list();

    expect(request).toHaveBeenCalledWith('/products');
    expect(products).toEqual([
      {
        id: 'a1',
        name: 'Milk',
        category: 'dairy',
        quantity: {
          count: 2,
          packaging: 'bottle',
          content: { size: 1, unit: 'l' },
        },
        expirationDate: '2026-12-01',
        isFavorite: false,
      },
    ]);
  });

  it('lists nothing for an empty inventory', async () => {
    const { apiClient } = createApiClientReturning({ products: [] });

    expect(await createApiProductRepository(apiClient).list()).toEqual([]);
  });

  it('creates a product with a POST and returns it mapped', async () => {
    const { apiClient, request } = createApiClientReturning({
      productId: 'b2',
      name: 'Rice',
      quantity: 2,
      packaging: 'box',
      category: 'food',
      expirationDate: '2027-01-31',
    });

    const product = await createApiProductRepository(apiClient).create({
      name: 'Rice',
      category: 'food',
      quantity: { count: 2, packaging: 'box' },
      expirationDate: '2027-01-31',
    });

    expect(request).toHaveBeenCalledWith('/products', {
      method: 'POST',
      body: {
        name: 'Rice',
        category: 'food',
        expirationDate: '2027-01-31',
        quantity: 2,
        packaging: 'box',
      },
    });
    expect(product).toEqual(
      expect.objectContaining({ id: 'b2', name: 'Rice', isFavorite: false })
    );
  });

  it.each([
    ['network', 'offline'],
    ['unauthorized', 'unauthorized'],
    ['server', 'server'],
    ['validation', 'unknown'],
    ['not-found', 'unknown'],
  ] as const)(
    'reports the api error %s as %s when listing',
    async (apiCode, expected) => {
      const apiClient = {
        request: jest.fn().mockRejectedValue(new ApiError(apiCode)),
      } as unknown as ApiClient;

      await expect(
        createApiProductRepository(apiClient).list()
      ).rejects.toEqual(errorWithCode(expected));
    }
  );

  it('reports the api error when creating too', async () => {
    const apiClient = {
      request: jest.fn().mockRejectedValue(new ApiError('network')),
    } as unknown as ApiClient;

    await expect(
      createApiProductRepository(apiClient).create({
        name: 'Rice',
        category: 'food',
        quantity: { count: 1 },
        expirationDate: '2027-01-31',
      })
    ).rejects.toEqual(errorWithCode('offline'));
  });

  it('updates the counts with one PATCH, sending them as the quantity', async () => {
    const { apiClient, request } = createApiClientReturning(undefined);

    await createApiProductRepository(apiClient).updateQuantities([
      { productId: 'a1', count: 5 },
      { productId: 'b2', count: 0 },
    ]);

    expect(request).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledWith('/products', {
      method: 'PATCH',
      body: {
        products: [
          { productId: 'a1', quantity: 5 },
          { productId: 'b2', quantity: 0 },
        ],
      },
    });
  });

  it('removes the products with one batch delete', async () => {
    const { apiClient, request } = createApiClientReturning(undefined);

    await createApiProductRepository(apiClient).remove(['a1', 'b2']);

    expect(request).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledWith('/products/batch-delete', {
      method: 'POST',
      body: { productIds: ['a1', 'b2'] },
    });
  });

  it('splits more than 25 entries into several calls', async () => {
    const { apiClient, request } = createApiClientReturning(undefined);
    const productIds = Array.from({ length: 26 }, (_, index) => `id-${index}`);

    await createApiProductRepository(apiClient).remove(productIds);

    expect(request).toHaveBeenCalledTimes(2);
    expect(request.mock.calls[0][1].body.productIds).toHaveLength(25);
    expect(request.mock.calls[1][1].body.productIds).toEqual(['id-25']);
  });

  it('sends nothing when there is nothing to change', async () => {
    const { apiClient, request } = createApiClientReturning(undefined);
    const repository = createApiProductRepository(apiClient);

    await repository.updateQuantities([]);
    await repository.remove([]);

    expect(request).not.toHaveBeenCalled();
  });

  it('reports a failed bulk call by its cause', async () => {
    const apiClient = {
      request: jest.fn().mockRejectedValue(new ApiError('server')),
    } as unknown as ApiClient;
    const repository = createApiProductRepository(apiClient);

    await expect(
      repository.updateQuantities([{ productId: 'a1', count: 1 }])
    ).rejects.toEqual(errorWithCode('server'));
    await expect(repository.remove(['a1'])).rejects.toEqual(
      errorWithCode('server')
    );
  });

  it('reports an unexpected failure as unknown', async () => {
    const apiClient = {
      request: jest.fn().mockRejectedValue(new Error('crashed')),
    } as unknown as ApiClient;

    await expect(createApiProductRepository(apiClient).list()).rejects.toEqual(
      errorWithCode('unknown')
    );
  });

  it('rejects a favorite change because the backend cannot store it', async () => {
    const { apiClient } = createApiClientReturning({ products: [] });

    await expect(
      createApiProductRepository(apiClient).setFavorite('a1', true)
    ).rejects.toThrow();
  });
});
