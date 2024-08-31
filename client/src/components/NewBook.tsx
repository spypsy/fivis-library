import { DeleteOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, Image, Input, List, Select, Tag } from 'antd';
import { languages } from 'countries-list';
import React, { useState } from 'react';
import { Book, Tag as TagType, UserEntryFields } from 'types';

type NewBookProps = {
  book: Book;
  userFields: UserEntryFields;
  tags: TagType[];
  editBookInfo: (info: Partial<UserEntryFields>) => void;
  removeBook: (isbn: string) => void;
  onStartEditingBook: () => void;
  onStopEditingBook: () => void;
};

const NewBook = ({
  book,
  userFields,
  tags,
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
          {(book.subtitle || isEditingBook) && (
            <p>
              Subtitle:{' '}
              {isEditingBook ? (
                <Input
                  style={{ display: 'inline-block', width: 'auto' }}
                  value={userFields.subtitle || book.subtitle}
                  onChange={e => editBookInfo({ subtitle: e.target.value })}
                />
              ) : (
                userFields.subtitle || book.subtitle
              )}
            </p>
          )}
          {book.publishedDate && <p>Published: {book.publishedDate}</p>}
          {book.language && <p>Language: {languages[book.language].name}</p>}
          {(book.publisher || isEditingBook) &&
            (isEditingBook ? (
              <p>
                {' '}
                Publisher:{' '}
                <Input
                  style={{ display: 'inline-block', width: 'auto' }}
                  value={userFields.publisher || book.publisher}
                  onChange={e => editBookInfo({ publisher: e.target.value || '' })}
                ></Input>
              </p>
            ) : (
              <p>Publisher: {book.publisher}</p>
            ))}

          {!isEditingBook && !!userFields.tags?.length && (
            <p>
              Tags:{' '}
              {userFields.tags.map(tag => (
                <Tag key={tag.name}>{tag.name}</Tag>
              ))}
            </p>
          )}
          {!isEditingBook && userFields.originalPublishedYear && (
            <p>Originally Published: {userFields.originalPublishedYear}</p>
          )}
          {!isEditingBook && userFields.originalLanguage && (
            <p>Original Language: {languages[userFields.originalLanguage].name}</p>
          )}
          {!isEditingBook && userFields.comment && (
            <p>
              Comment: <p className="comment-value">{userFields.comment}</p>
            </p>
          )}
          {/** EDIT FIELDS */}
          {isEditingBook && (
            <div className="edit-fields">
              <Select
                placeholder="Tags"
                mode="tags"
                onChange={(val: string[]) =>
                  editBookInfo({
                    tags: val.map(tag => tags.find(t => t.name === tag) || { name: tag }),
                  })
                }
                value={userFields.tags?.map(tag => tag.name)}
                options={tags.map(tag => ({ label: tag.name, value: tag.name }))}
              />
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
              <Input.TextArea
                rows={4}
                placeholder="Add a comment..."
                value={userFields.comment}
                onChange={e => {
                  editBookInfo({
                    comment: e.target.value,
                  });
                }}
              />
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
