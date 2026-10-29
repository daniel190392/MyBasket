import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { withUpdatedCounts, withoutProducts } from '../domain/editChanges';
import { NO_FILTER, appendPage, toListRequest } from '../domain/productList';
import { productErrorCode } from '../domain/ProductRepositoryError';

import type { Product, ProductDraft } from '../domain/product';
import type { ProductFilter } from '../domain/productList';
import type {
  ProductRepository,
  QuantityUpdate,
} from '../domain/ProductRepository';
import type { ProductErrorCode } from '../domain/ProductRepositoryError';

import type { ReactNode } from 'react';

export type ProductsStatus = 'loading' | 'ready' | 'error';

interface ProductsContextValue {
  status: ProductsStatus;
  // Why the first load failed; only meaningful while the status is 'error'.
  errorCode: ProductErrorCode;
  // The products loaded so far, for the current filter.
  products: Product[];
  filter: ProductFilter;
  // Starts the list again from its first page.
  changeFilter: (change: Partial<ProductFilter>) => void;
  reload: () => void;
  isLoadingMore: boolean;
  hasLoadMoreFailed: boolean;
  loadMore: () => Promise<void>;
  // Pull to refresh: keeps showing the list while it loads again.
  refresh: () => Promise<void>;
  isRefreshing: boolean;
  hasRefreshFailed: boolean;
  addProduct: (draft: ProductDraft) => Promise<void>;
  // Both reject when the repository does and leave the list as it was.
  updateQuantities: (updates: QuantityUpdate[]) => Promise<void>;
  removeProducts: (productIds: string[]) => Promise<void>;
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
  const [filter, setFilter] = useState<ProductFilter>(NO_FILTER);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasLoadMoreFailed, setHasLoadMoreFailed] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);
  // Counts the times the list starts again, so an answer to a request made
  // for an older list (another filter, a refresh) is thrown away.
  const listVersion = useRef(0);

  useEffect(() => {
    let isCancelled = false;
    listVersion.current += 1;
    setStatus('loading');
    setIsLoadingMore(false);
    setHasLoadMoreFailed(false);

    repository
      .list(toListRequest(filter))
      .then((page) => {
        if (isCancelled) return;
        setProducts(page.products);
        setNextCursor(page.nextCursor);
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
  }, [repository, filter, reloadCount]);

  const changeFilter = useCallback((change: Partial<ProductFilter>) => {
    setFilter((current) => {
      const next = { ...current, ...change };
      const isSame =
        next.query === current.query && next.category === current.category;
      // Returning the same object keeps the list as it is.
      return isSame ? current : next;
    });
  }, []);

  const reload = useCallback(() => {
    setReloadCount((count) => count + 1);
  }, []);

  const refresh = useCallback(async () => {
    const version = (listVersion.current += 1);
    setIsRefreshing(true);
    setHasRefreshFailed(false);
    setIsLoadingMore(false);
    setHasLoadMoreFailed(false);
    try {
      const page = await repository.list(toListRequest(filter));
      if (version !== listVersion.current) return;
      setProducts(page.products);
      setNextCursor(page.nextCursor);
    } catch {
      if (version === listVersion.current) setHasRefreshFailed(true);
    } finally {
      setIsRefreshing(false);
    }
  }, [repository, filter]);

  const loadMore = useCallback(async () => {
    if (nextCursor === null || isLoadingMore) return;
    const version = listVersion.current;
    setIsLoadingMore(true);
    setHasLoadMoreFailed(false);
    try {
      const page = await repository.list(toListRequest(filter, nextCursor));
      if (version !== listVersion.current) return;
      setProducts((current) => appendPage(current, page.products));
      setNextCursor(page.nextCursor);
      setIsLoadingMore(false);
    } catch {
      if (version !== listVersion.current) return;
      setHasLoadMoreFailed(true);
      setIsLoadingMore(false);
    }
  }, [repository, filter, nextCursor, isLoadingMore]);

  // Rejects when the repository does, so the form can tell the user. The list
  // starts again because the new product can belong in a page not loaded yet.
  const addProduct = useCallback(
    async (draft: ProductDraft) => {
      await repository.create(draft);
      refresh();
    },
    [repository, refresh]
  );

  const updateQuantities = useCallback(
    async (updates: QuantityUpdate[]) => {
      await repository.updateQuantities(updates);
      setProducts((current) => withUpdatedCounts(current, updates));
    },
    [repository]
  );

  const removeProducts = useCallback(
    async (productIds: string[]) => {
      await repository.remove(productIds);
      setProducts((current) => withoutProducts(current, productIds));
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
      filter,
      changeFilter,
      reload,
      isLoadingMore,
      hasLoadMoreFailed,
      loadMore,
      refresh,
      isRefreshing,
      hasRefreshFailed,
      addProduct,
      updateQuantities,
      removeProducts,
      toggleFavorite,
    }),
    [
      status,
      errorCode,
      products,
      filter,
      changeFilter,
      reload,
      isLoadingMore,
      hasLoadMoreFailed,
      loadMore,
      refresh,
      isRefreshing,
      hasRefreshFailed,
      addProduct,
      updateQuantities,
      removeProducts,
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
