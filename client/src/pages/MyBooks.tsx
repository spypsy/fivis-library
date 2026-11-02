import { Button } from 'antd';
import PageShell from 'components/PageShell';
import UserBooksTable from 'components/UserBooksTable';
import { useActiveLibrary } from 'hooks/activeLibrary';
import { useCachedUserBooks } from 'hooks/useCachedUserBooks';
import React, { useState } from 'react';

const MyBooks = () => {
  const { booksData, refreshBooks, showTableLoading } = useCachedUserBooks();
  const [randomBookOpen, setRandomBookOpen] = useState(false);
  const { activeLibrary, isViewingShared } = useActiveLibrary();

  const total = booksData?.length ?? 0;
  const title = isViewingShared ? `${activeLibrary!.ownerName}'s books` : 'My books';

  return (
    <PageShell
      wide
      title={title}
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
        persistUiState={!isViewingShared}
        readOnly={isViewingShared}
        onAfterDelete={isViewingShared ? undefined : refreshBooks}
      />
    </PageShell>
  );
};

export default MyBooks;
