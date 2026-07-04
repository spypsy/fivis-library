import { Button } from 'antd';
import PageShell from 'components/PageShell';
import UserBooksTable from 'components/UserBooksTable';
import { useCachedUserBooks } from 'hooks/useCachedUserBooks';
import React, { useState } from 'react';

const MyBooks = () => {
  const { booksData, refreshBooks, showTableLoading } = useCachedUserBooks();
  const [randomBookOpen, setRandomBookOpen] = useState(false);

  const total = booksData?.length ?? 0;

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
        onAfterDelete={refreshBooks}
      />
    </PageShell>
  );
};

export default MyBooks;
