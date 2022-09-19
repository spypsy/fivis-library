import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Card, Descriptions, Input, List, Modal } from 'antd';
import useAxios from 'axios-hooks';
import { Book } from 'types';

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

const formatDate = (date: Date) => {
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
};

const ScanModal = ({ toggleModal, isOpen }: ScanModalProps) => {
  const [
    { data: bookData, loading: bookLoading, error: bookScanError },
    postBarcode,
  ] = useAxios<Book>({}, { manual: true });
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    if (bookData) {
      console.log('book', bookData);
      if (bookData.title && !books.find(({ isbn }) => bookData.isbn === isbn)) {
        setBooks((state) => [...state, bookData]);
      }
    }
  }, [bookData, setBooks, books]);

  const onSubmit = (value: string) => {
    postBarcode({ url: `/api/books/isbn/${value}` });
  };

  return (
    <Modal title="Add Book" visible={isOpen} onCancel={toggleModal}>
      <p>Waiting for scan...</p>
      <div id="book-scan-input">
        <Input
          autoFocus
          onChange={(e) => {
            const value = (e.target as HTMLInputElement)?.value;
            if (value?.length > 9) {
              onSubmit(value);
            }
          }}
        />
      </div>
      <List
        dataSource={books}
        renderItem={(book) => (
          <List.Item>
            <Card title={book.title}>
              <div>
                <p>Author: {book.authors?.join(',')}</p>
                <p>Published: {book.publishedDate}</p>
              </div>
            </Card>
          </List.Item>
        )}
      />
    </Modal>
  );
};

ScanModal.propTypes = {};

export default ScanModal;