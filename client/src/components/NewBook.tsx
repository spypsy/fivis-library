import { DeleteOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, Image, Input, List, Select } from 'antd';
import { languages } from 'countries-list';
import React, { useState } from 'react';
import { Book, UserEntryFields } from 'types';

type NewBookProps = {
  book: Book;
  userFields: UserEntryFields;
  editBookInfo: (info: Partial<UserEntryFields>) => void;
  removeBook: (isbn: string) => void;
  onStartEditingBook: () => void;
  onStopEditingBook: () => void;
};

const NewBook = ({
  book,
  userFields,
  editBookInfo,
  removeBook,
  onStartEditingBook,
  onStopEditingBook,
}: NewBookProps) => {
  const [isEditingBook, setEditingBook] = useState<boolean>(false);

  const startEditingBook = () => {
    onStartEditingBook();
    setEditingBook(true);
  };

  const stopEditingBook = () => {
    onStopEditingBook();
    setEditingBook(false);
  };
  return (
    <List.Item>
      <Card title={book.title} className="book-preview">
        <div>
          {book.imageLinks && (
            <Image src={book.imageLinks.thumbnail} preview={{ src: book.imageLinks.smallThumbnail }} />
          )}
          <p>Author: {book.authors?.join(', ')}</p>
          {book.publishedDate && <p>Published: {book.publishedDate}</p>}
          {book.publisher && <p>Publisher: {book.publisher}</p>}
          {book.language && <p>Language: {languages[book.language].name}</p>}
          {!isEditingBook && userFields.originalPublishedYear && (
            <p>Originally Published: {userFields.originalPublishedYear}</p>
          )}
          {!isEditingBook && userFields.originalLanguage && (
            <p>Original Language: {languages[userFields.originalLanguage].name}</p>
          )}
          {/** EDIT FIELDS */}
          {isEditingBook && (
            <div className="edit-fields">
              <Input
                placeholder="Originally Published Year"
                type="number"
                value={userFields.originalPublishedYear}
                onChange={e =>
                  editBookInfo({
                    originalPublishedYear: Number(e.target.value),
                  })
                }
              />
              <Select
                showSearch
                placeholder="Original Language"
                defaultValue={userFields.originalLanguage}
                onChange={value => {
                  editBookInfo({
                    originalLanguage: value,
                  });
                }}
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                options={Object.entries(languages).map(([key, lang]) => ({
                  label: lang.name,
                  value: key,
                }))}
              />
              <Input.TextArea rows={4} placeholder="Add a comment..." />
            </div>
          )}
        </div>
        <div className="action-buttons">
          <Button
            shape="circle"
            type={isEditingBook ? 'primary' : 'default'}
            icon={isEditingBook ? <SaveOutlined /> : <EditOutlined />}
            onClick={() => {
              isEditingBook ? stopEditingBook() : startEditingBook();
            }}
          />
          <Button
            danger
            className="delete-button"
            type="primary"
            shape="circle"
            icon={<DeleteOutlined />}
            onClick={() => removeBook(book.isbn)}
          />
        </div>
      </Card>
    </List.Item>
  );
};

NewBook.propTypes = {};

export default NewBook;
