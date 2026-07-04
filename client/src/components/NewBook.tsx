import { DeleteOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, Image, Input, List, Select, Tag } from 'antd';
import BookAuthorsEditor from 'components/BookAuthorsEditor';
import { languages } from 'countries-list';
import React, { useState } from 'react';
import { Book, Tag as TagType, UserEntryFields, Author } from 'types';
import { normalizeAuthorsInput } from 'utils/searchAuthors';

type ScanBookEditFields = Partial<UserEntryFields & Pick<Book, 'authors' | 'subtitle' | 'publisher' | 'title'>>;

type NewBookProps = {
  book: Book;
  userFields: UserEntryFields;
  tags: TagType[];
  editBookInfo: (info: ScanBookEditFields) => void;
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
      <Card
        title={
          isEditingBook ? (
            <Input value={book.title} onChange={e => editBookInfo({ title: e.target.value })} />
          ) : (
            book.title
          )
        }
        className="book-preview"
      >
        <div className="book-preview-meta">
          {book.imageLinks && (
            <Image src={book.imageLinks.thumbnail} preview={{ src: book.imageLinks.smallThumbnail }} />
          )}
          <div className="book-preview-row book-preview-authors">
            <span className="book-preview-label">Authors</span>
            <BookAuthorsEditor
              authors={normalizeAuthorsInput(book.authors as (Author | string)[] | undefined)}
              editMode={isEditingBook}
              onChange={authors => editBookInfo({ authors })}
            />
          </div>
          {(book.subtitle || isEditingBook) && (
            <div className="book-preview-row">
              <span className="book-preview-label">Subtitle</span>
              {isEditingBook ? (
                <Input
                  value={userFields.subtitle || book.subtitle}
                  onChange={e => editBookInfo({ subtitle: e.target.value })}
                />
              ) : (
                userFields.subtitle || book.subtitle
              )}
            </div>
          )}
          {book.publishedDate && (
            <div className="book-preview-row book-preview-readonly">Published: {book.publishedDate}</div>
          )}
          {book.language && (
            <div className="book-preview-row book-preview-readonly">Language: {languages[book.language].name}</div>
          )}
          {(book.publisher || isEditingBook) && (
            <div className="book-preview-row">
              <span className="book-preview-label">Publisher</span>
              {isEditingBook ? (
                <Input
                  value={userFields.publisher || book.publisher}
                  onChange={e => editBookInfo({ publisher: e.target.value || '' })}
                />
              ) : (
                book.publisher
              )}
            </div>
          )}

          {!isEditingBook && !!userFields.tags?.length && (
            <div className="book-preview-row book-preview-readonly">
              Tags:{' '}
              {userFields.tags.map(tag => (
                <Tag key={tag.name}>{tag.name}</Tag>
              ))}
            </div>
          )}
          {!isEditingBook && userFields.originalPublishedYear && (
            <div className="book-preview-row book-preview-readonly">
              Originally Published: {userFields.originalPublishedYear}
            </div>
          )}
          {!isEditingBook && userFields.originalLanguage && (
            <div className="book-preview-row book-preview-readonly">
              Original Language: {languages[userFields.originalLanguage].name}
            </div>
          )}
          {!isEditingBook && userFields.comment && (
            <div className="book-preview-row book-preview-readonly">
              Comment: <p className="comment-value">{userFields.comment}</p>
            </div>
          )}
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
