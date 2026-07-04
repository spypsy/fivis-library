import axios from 'axios';
import { Button } from 'antd';
import useAxios from 'axios-hooks';
import PageShell from 'components/PageShell';
import UserBooksTable from 'components/UserBooksTable';
import React, { useCallback, useEffect, useState } from 'react';
import { UserBook } from 'types';
import { readMyBooksCache, writeMyBooksCache } from 'utils/myBooksStorage';

const MyBooks = () => {
  const [booksData, setBooksData] = useState<UserBook[] | undefined>(() => readMyBooksCache());
  const [{ loading }, refetch] = useAxios<UserBook[]>('/api/books/mine', { manual: true, useCache: false });
  const [randomBookOpen, setRandomBookOpen] = useState(false);

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

  const refreshBooksAfterDelete = useCallback(async () => {
    const { data } = await axios.get<UserBook[]>('/api/books/mine');
    setBooksData(data);
    writeMyBooksCache(data);
    return data;
  }, []);

  const total = booksData?.length ?? 0;
  const showTableLoading = loading && booksData === undefined;

  return (
    <PageShell
      wide
      title="My books"
      subtitle={total === 1 ? '1 book' : `${total} books`}
      extra={
        <Button type="primary" onClick={() => setRandomBookOpen(true)}>
          Random book
        </Button>
      }
    >
      <UserBooksTable
        booksData={booksData}
        loading={showTableLoading}
        randomBookOpen={randomBookOpen}
        onRandomBookOpenChange={setRandomBookOpen}
        persistUiState
        onAfterDelete={refreshBooksAfterDelete}
      />
    </PageShell>
  );
};

export default MyBooks;
