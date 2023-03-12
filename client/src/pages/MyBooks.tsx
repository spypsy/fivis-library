import { Table, Tag } from 'antd';
import useAxios from 'axios-hooks';
import React from 'react';
import { Author, Book } from 'types';

const MyBooks = () => {
  const [{ data: booksData, loading, error }] = useAxios<Book[]>({
    url: '/api/books/mine',
  });
  console.log(booksData);
  return (
    <div>
      <Table dataSource={booksData}>
        <Table.Column title="Title" dataIndex="title" key="title" />
        <Table.Column
          title="Publish Date"
          dataIndex="publishedDate"
          key="publishedDate"
          render={(publishedDate) => (
            <span>
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
            authors.map((author) => <Tag key={author.name}>{author.name}</Tag>)
          }
        />
        <Table.Column title="ISBN" dataIndex="isbn" key="isbn" />
      </Table>
    </div>
  );
};

export default MyBooks;
