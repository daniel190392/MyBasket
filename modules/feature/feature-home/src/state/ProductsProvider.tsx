import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { productErrorCode } from '../domain/ProductRepositoryError';

import type { Product, ProductDraft } from '../domain/product';
import type { ProductRepository } from '../domain/ProductRepository';
import type { ProductErrorCode } from '../domain/ProductRepositoryError';

import type { ReactNode } from 'react';

export type ProductsStatus = 'loading' | 'ready' | 'error';

interface ProductsContextValue {
  status: ProductsStatus;
  // Why the first load failed; only meaningful while the status is 'error'.
  errorCode: ProductErrorCode;
  products: Product[];
  reload: () => void;
  // Pull to refresh: keeps showing the list while it loads again.
  refresh: () => Promise<void>;
  isRefreshing: boolean;
  hasRefreshFailed: boolean;
  addProduct: (draft: ProductDraft) => Promise<void>;
  toggleFavorite: (productId: string) => void;
}

const ProductsContext = createContext<ProductsContextValue | null>(null);

interface ProductsProviderProps {
  repository: ProductRepository;
  children: ReactNode;
}

export function ProductsProvider({
  repository,
  children,
}: ProductsProviderProps) {
  const [status, setStatus] = useState<ProductsStatus>('loading');
  const [errorCode, setErrorCode] = useState<ProductErrorCode>('unknown');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasRefreshFailed, setHasRefreshFailed] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    repository
      .list()
      .then((loadedProducts) => {
        if (isCancelled) return;
        setProducts(loadedProducts);
        setStatus('ready');
      })
      .catch((error: unknown) => {
        if (isCancelled) return;
        setErrorCode(productErrorCode(error));
        setStatus('error');
      });

    return () => {
      isCancelled = true;
    };
  }, [repository, reloadCount]);

  const reload = useCallback(() => {
    setStatus('loading');
    setReloadCount((count) => count + 1);
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setHasRefreshFailed(false);
    try {
      setProducts(await repository.list());
    } catch {
      setHasRefreshFailed(true);
    } finally {
      setIsRefreshing(false);
    }
  }, [repository]);

  // Rejects when the repository does, so the form can tell the user.
  const addProduct = useCallback(
    async (draft: ProductDraft) => {
      const created = await repository.create(draft);
      setProducts((current) => [...current, created]);
    },
    [repository]
  );

  // The star answers right away; if the repository rejects the change the
  // list is loaded again, so the screen never shows a state that was not saved.
  const toggleFavorite = useCallback(
    (productId: string) => {
      const product = products.find((candidate) => candidate.id === productId);
      if (!product) return;

      const isFavorite = !product.isFavorite;
      setProducts((current) =>
        current.map((candidate) =>
          candidate.id === productId ? { ...candidate, isFavorite } : candidate
        )
      );
      repository.setFavorite(productId, isFavorite).catch(reload);
    },
    [products, repository, reload]
  );

  const value = useMemo(
    () => ({
      status,
      errorCode,
      products,
      reload,
      refresh,
      isRefreshing,
      hasRefreshFailed,
      addProduct,
      toggleFavorite,
    }),
    [
      status,
      errorCode,
      products,
      reload,
      refresh,
      isRefreshing,
      hasRefreshFailed,
      addProduct,
      toggleFavorite,
    ]
  );

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts(): ProductsContextValue {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used inside a ProductsProvider');
  }
  return context;
}
