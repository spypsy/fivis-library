import { List, Modal, message } from 'antd';
import useAxios from 'axios-hooks';
import React, { useEffect, useState } from 'react';
import { Book, BookSaveData, UserBook, UserEntryFields } from 'types';

import NewBook from './NewBook';

type ScanModalProps = {
  toggleModal: () => void;
  isOpen: boolean;
};

const ScanModal = ({ toggleModal, isOpen }: ScanModalProps) => {
  const [books, setBooks] = useState<UserBook[]>([]);
  const [isEditingBook, setEditingBook] = useState<boolean>(false);
  const [justSearched, setJustSearched] = useState<boolean>(false);

  const [{ data: bookData, loading: bookLoading }, postBarcode] = useAxios<Book>({}, { manual: true, useCache: false });

  const [{ data: bookSaveData, loading: bookSaveLoading }, submitBooks] = useAxios<BookSaveData>({}, { manual: true });

  useEffect(() => {
    if (!!bookSaveData?.booksAdded) {
      setJustSearched(false);
      setBooks([]);
      message.success(`Added ${bookSaveData.booksAdded} new books.`);
      toggleModal();
    }
  }, [bookSaveData, setBooks, toggleModal]);

  const isbnInput = React.createRef<HTMLInputElement>();

  // ensure hidden input is focused for barcode scanning
  useEffect(() => {
    if (!isEditingBook) {
      isOpen && isbnInput?.current?.focus();
    }
  }, [isbnInput, isOpen, isEditingBook]);

  // update UI for newly scanned book
  useEffect(() => {
    if (justSearched && bookData?.title && !books.find(({ isbn }) => bookData?.isbn === isbn)) {
      setBooks(state => [...state, bookData]);
    }
  }, [bookData, setBooks, books, justSearched]);

  const onSubmitBarcode = (value: string) => {
    setJustSearched(true);
    postBarcode({ url: `/api/books/search-external/${value}` });
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

  return (
    <Modal
      title="Add Book"
      visible={isOpen}
      onCancel={toggleModal}
      onOk={onSubmitUserBooks}
      okText="Submit"
      okButtonProps={{ disabled: !books.length }}
      confirmLoading={bookSaveLoading}
    >
      <div onClick={() => isOpen && !isEditingBook && isbnInput?.current?.focus()}>
        <p>Waiting for scan...</p>
        <div id="book-scan-input">
          {isOpen && (
            <input
              disabled={bookLoading}
              autoFocus
              ref={isbnInput}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  onSubmitBarcode((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
          )}
        </div>
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
          renderItem={(book, index) => {
            const editBookInfo = createEditBookInfo(index);
            return (
              <NewBook
                book={book}
                userFields={book}
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

ScanModal.propTypes = {};

export default ScanModal;
