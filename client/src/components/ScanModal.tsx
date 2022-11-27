import React, { useEffect, useState } from 'react';
import { Button, Card, Image, List, Modal, Space } from 'antd';
import useAxios from 'axios-hooks';
import { Book } from 'types';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

interface ScanModalProps {
  toggleModal: () => void;
  isOpen: boolean;
}

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// const formatDate = (date: Date) => {
//   return `${months[date.getMonth()]} ${date.getFullYear()}`;
// };

const ScanModal = ({ toggleModal, isOpen }: ScanModalProps) => {
  const [
    { data: bookData, loading: bookLoading, error: bookScanError },
    postBarcode,
  ] = useAxios<Book>({}, { manual: true });
  const [books, setBooks] = useState<Book[]>([]);

  const [{ data: bookSaveData, loading: bookSaveLoading }, submitBooks] =
    useAxios<Book[]>({}, { manual: true });

  const emailInput = React.createRef<HTMLInputElement>();

  useEffect(() => {
    isOpen && emailInput?.current?.focus();
  }, [emailInput, isOpen]);

  useEffect(() => {
    if (bookData) {
      console.log('book', bookData);
      if (bookData.title && !books.find(({ isbn }) => bookData.isbn === isbn)) {
        setBooks((state) => [...state, bookData]);
      }
    }
  }, [bookData, setBooks, books]);

  const onSubmitBarcode = (value: string) => {
    postBarcode({ url: `/api/books/isbn/${value}` });
  };

  const onSubmitUserBooks = () => {
    // TODO: add `userEntryData` for each book here
    const booksData = books.map((book) => ({ bookData }));
    if (booksData.length) {
      submitBooks({ url: '/api/books/multi', data: books });
    }
  };

  const removeBook = (isbnToRemove: string | undefined) => {
    if (isbnToRemove) {
      setBooks(books.filter(({ isbn }) => isbn !== isbnToRemove));
    }
  };

  return (
    <Modal
      title="Add Book"
      visible={isOpen}
      onCancel={toggleModal}
      onOk={onSubmitUserBooks}
      okText="Submit"
      confirmLoading={bookSaveLoading}
    >
      <div onClick={() => isOpen && emailInput?.current?.focus()}>
        <p>Waiting for scan...</p>
        <div id="book-scan-input">
          {isOpen && (
            <input
              disabled={bookLoading}
              autoFocus
              ref={emailInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSubmitBarcode((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
          )}
        </div>
        <List
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 4,
            lg: 4,
            xl: 6,
            xxl: 3,
          }}
          dataSource={books}
          renderItem={(book) => (
            <List.Item>
              <Card title={book.title} className="book-preview">
                <div>
                  {book.imageLinks && (
                    <Image
                      src={book.imageLinks.thumbnail}
                      preview={{ src: book.imageLinks.smallThumbnail }}
                    />
                  )}
                  <p>Author: {book.authors?.join(',')}</p>
                  <p>Published: {book.publishedDate}</p>
                </div>
                <Space className="action-buttons">
                  <Button
                    danger
                    type="primary"
                    shape="circle"
                    icon={<DeleteOutlined />}
                    onClick={() => removeBook(book.isbn)}
                  />
                  {/* disabled button until edit functionality is added */}
                  <Button shape="circle" icon={<EditOutlined />} disabled />
                </Space>
              </Card>
            </List.Item>
          )}
        />
      </div>
    </Modal>
  );
};

ScanModal.propTypes = {};

export default ScanModal;
