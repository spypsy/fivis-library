import axios from 'axios';
import useAxios from 'axios-hooks';
import { useActiveLibrary } from 'hooks/activeLibrary';
import { useCallback, useEffect, useState } from 'react';
import { UserBook } from 'types';
import { readMyBooksCache, writeMyBooksCache } from 'utils/myBooksStorage';

export function useCachedUserBooks() {
  const { isViewingShared, activeLibrary } = useActiveLibrary();
  const [booksData, setBooksData] = useState<UserBook[] | undefined>(() =>
    isViewingShared ? undefined : readMyBooksCache(),
  );
  const [{ loading }, refetch] = useAxios<UserBook[]>('/api/books/mine', { manual: true, useCache: false });

  useEffect(() => {
    let cancelled = false;
    if (!isViewingShared) {
      setBooksData(readMyBooksCache());
    } else {
      setBooksData(undefined);
    }
    refetch().then(response => {
      if (cancelled) return;
      const fresh = response.data;
      if (fresh) {
        setBooksData(fresh);
        if (!isViewingShared) {
          writeMyBooksCache(fresh);
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, [refetch, isViewingShared, activeLibrary?.ownerId]);

  const refreshBooks = useCallback(async () => {
    const { data } = await axios.get<UserBook[]>('/api/books/mine');
    setBooksData(data);
    if (!isViewingShared) {
      writeMyBooksCache(data);
    }
    return data;
  }, [isViewingShared]);

  const showTableLoading = loading && booksData === undefined;

  return { booksData, loading, refreshBooks, showTableLoading };
}
