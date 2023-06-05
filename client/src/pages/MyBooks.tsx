import { Table, Tag } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Author, Book } from 'types';
const MyBooks = () => {
  const [loading, setLoading] = useState(true);
  const [booksData, setBooksData] = useState<Book[]>([]);
  useEffect(() => {
    axios
      .get('/api/books/mine')
      .then((res) => setBooksData(res.data))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div>
      <Table dataSource={booksData} rowKey={({ isbn }) => isbn}>
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
          render={(publishedDate) => (
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
            authors.map((author) => (
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
