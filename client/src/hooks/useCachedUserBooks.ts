import axios from 'axios';
import useAxios from 'axios-hooks';
import { useCallback, useEffect, useState } from 'react';
import { UserBook } from 'types';
import { readMyBooksCache, writeMyBooksCache } from 'utils/myBooksStorage';

export function useCachedUserBooks() {
  const [booksData, setBooksData] = useState<UserBook[] | undefined>(() => readMyBooksCache());
  const [{ loading }, refetch] = useAxios<UserBook[]>('/api/books/mine', { manual: true, useCache: false });

  useEffect(() => {
    let cancelled = false;
    refetch().then(response => {
      if (cancelled) return;
      const fresh = response.data;
      if (fresh) {
        setBooksData(fresh);
        writeMyBooksCache(fresh);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [refetch]);

  const refreshBooks = useCallback(async () => {
    const { data } = await axios.get<UserBook[]>('/api/books/mine');
    setBooksData(data);
    writeMyBooksCache(data);
    return data;
  }, []);

  const showTableLoading = loading && booksData === undefined;

  return { booksData, loading, refreshBooks, showTableLoading };
}
