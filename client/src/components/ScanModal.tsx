import { List, Modal, Typography, message } from 'antd';
import useAxios from 'axios-hooks';
import React, { useEffect, useState } from 'react';
import { Book, BookSaveData, Tag, UserBook, UserEntryFields } from 'types';

import NewBook from './NewBook';

type ScanModalProps = {
  toggleModal: () => void;
  isOpen: boolean;
};

const ScanModal = ({ toggleModal, isOpen }: ScanModalProps) => {
  const [books, setBooks] = useState<UserBook[]>([]);
  const [isEditingBook, setEditingBook] = useState<boolean>(false);
  const [justSearched, setJustSearched] = useState<boolean>(false);

  const [{ data: bookData, loading: bookLoading, error: scanError }, postBarcode] = useAxios<Book>(
    {},
    { manual: true, useCache: false },
  );

  const [{ data: bookSaveData, loading: bookSaveLoading }, submitBooks] = useAxios<BookSaveData>({}, { manual: true });

  const [{ data: tagsData }] = useAxios<Tag[]>('/api/tags', { useCache: false });

  useEffect(() => {
    if (scanError) {
      message.error(scanError.response?.data || `Error scanning book: ${scanError.message}`);
    }
  }, [scanError]);

  useEffect(() => {
    if (!!bookSaveData?.duplicates?.length) {
      const duplicateTitles = bookSaveData.duplicates.map(isbn => books.find(b => b.isbn === isbn)?.title);
      message.warning(
        <div>
          Some books were not added because they already exist in the database.
          <List size="small">
            {duplicateTitles.map((title, index) => (
              <List.Item key={index}>{title}</List.Item>
            ))}
          </List>
        </div>,
      );
    }
    if (!!bookSaveData?.errors?.length) {
      message.error({
        key: 'book-save-error',
        content: (
          <div>
            Some books were not added.
            <List size="small">
              {bookSaveData.errors.map((error, index) => (
                <List.Item key={index}>{error}</List.Item>
              ))}
            </List>
          </div>
        ),
        duration: 0,
        onClick: () => {
          message.destroy('book-save-error');
        },
      });
    }
    if (!!bookSaveData?.booksAdded) {
      setJustSearched(false);
      setBooks([]);
      message.success(`Added ${bookSaveData.booksAdded} new books.`, 0.75);
      toggleModal();
    }
  }, [bookSaveData, toggleModal, books]);

  const isbnInput = React.createRef<HTMLInputElement>();

  useEffect(() => {
    if (!isEditingBook) {
      isOpen && isbnInput?.current?.focus();
    }
  }, [isbnInput, isOpen, isEditingBook]);

  useEffect(() => {
    if (justSearched && bookData?.title && !books.find(({ isbn }) => bookData?.isbn === isbn)) {
      setBooks(state => [...state, bookData]);
    }
  }, [bookData, books, justSearched]);

  const onSubmitBarcode = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }
    setJustSearched(true);
    postBarcode({ url: `/api/books/search-external/${trimmed}` });
  };

  const onSubmitUserBooks = () => {
    const booksData = books.map(book => ({ bookData: book }));
    if (booksData.length) {
      submitBooks({
        url: '/api/books/multi',
        data: booksData,
        method: 'POST',
      });
    }
  };

  const createEditBookInfo = (index: number) => (info: UserEntryFields) => {
    setBooks(state =>
      state.map((book, i) => {
        if (i === index) {
          return {
            ...book,
            ...info,
          };
        }
        return book;
      }),
    );
  };

  const removeBook = (isbnToRemove: string | undefined) => {
    if (isbnToRemove) {
      const updatedBooks = books.filter(({ isbn }) => isbn !== isbnToRemove);
      setJustSearched(false);
      setBooks(updatedBooks);
    }
  };

  const okText = books.length ? `Add ${books.length} book${books.length === 1 ? '' : 's'}` : 'Add books';
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <Modal
      title="Add books"
      className="book-scan-modal"
      open={isOpen}
      onCancel={toggleModal}
      onOk={onSubmitUserBooks}
      okText={okText}
      okButtonProps={{ disabled: !books.length }}
      confirmLoading={bookSaveLoading}
    >
      <div onClick={() => isOpen && !isEditingBook && isbnInput?.current?.focus()}>
        <Typography.Paragraph type="secondary">
          Scan a barcode or type an ISBN and press Enter.
        </Typography.Paragraph>
        <div className={isDev ? 'book-scan-input-dev' : 'book-scan-input-hidden'}>
          {isOpen && (
            <input
              disabled={bookLoading}
              autoFocus
              ref={isbnInput}
              aria-label="ISBN input"
              placeholder={isDev ? 'Type ISBN and press Enter' : undefined}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  onSubmitBarcode((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
          )}
        </div>
        {books.length === 0 && !bookLoading && (
          <Typography.Text type="secondary">Waiting for scan…</Typography.Text>
        )}
        <List
          loading={bookLoading}
          grid={{
            gutter: 12,
            xs: 1,
            sm: 2,
            md: 2,
            lg: 2,
            xl: 3,
            xxl: 3,
          }}
          dataSource={books}
          locale={{ emptyText: ' ' }}
          renderItem={(book, index) => {
            const editBookInfo = createEditBookInfo(index);
            return (
              <NewBook
                book={book}
                userFields={book}
                tags={tagsData || []}
                editBookInfo={editBookInfo}
                removeBook={removeBook}
                onStartEditingBook={() => setEditingBook(true)}
                onStopEditingBook={() => setEditingBook(false)}
              />
            );
          }}
        />
      </div>
    </Modal>
  );
};

export default ScanModal;
