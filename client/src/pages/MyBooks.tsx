import { Table, Tag } from 'antd';
import useAxios from 'axios-hooks';
import React from 'react';
import { Link } from 'react-router-dom';
import { Author, Book } from 'types';

const MyBooks = () => {
  const [{ data: booksData, loading, error }] = useAxios('/api/books/mine', { manual: false });
  return (
    <div>
      <Table loading={loading} dataSource={booksData} rowKey={({ isbn }) => isbn}>
        <Table.Column
          title="Title"
          dataIndex="title"
          key="title"
          render={(title: string, book: Book) => {
            return <Link to={`/book/${book.isbn}`}>{title}</Link>;
          }}
        />
        <Table.Column
          title="Publish Date"
          dataIndex="publishedDate"
          key="publishedDate"
          render={publishedDate => (
            <span key={publishedDate}>
              {new Date(publishedDate).toLocaleDateString('en-gb', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
              })}
            </span>
          )}
        />
        <Table.Column
          title="Author(s)"
          dataIndex="authors"
          key="authors"
          render={(authors: Author[]) =>
            authors.map(author => (
              <Tag color="grey" key={author.name}>
                {author.name}
              </Tag>
            ))
          }
        />
        <Table.Column title="ISBN" dataIndex="isbn" key="isbn" />
      </Table>
    </div>
  );
};

export default MyBooks;
