import { Table, Tag } from 'antd';
import useAxios from 'axios-hooks';
import React from 'react';
import { Link } from 'react-router-dom';
import { Author, Book, Tag as TagType } from 'types';

const MyBooks = () => {
  const [{ data: booksData, loading }] = useAxios('/api/books/mine', { manual: false });
  return (
    <div>
      Total: {booksData?.length}
      <Table
        loading={loading}
        dataSource={booksData}
        rowKey={({ isbn }) => isbn}
        pagination={{ showSizeChanger: true, pageSizeOptions: ['10', '25', '50', '100'], defaultPageSize: 25 }}
      >
        <Table.Column
          title="Title"
          dataIndex="title"
          key="title"
          render={(title: string, book: Book) => {
            return (
              <Link to={`/book/${book.isbn}`}>
                <b>{title}</b>
              </Link>
            );
          }}
        />
        <Table.Column
          title="Publish Year"
          dataIndex="publishedDate"
          key="publishedDate"
          render={publishedDate => (
            <span key={publishedDate}>
              {new Date(publishedDate).toLocaleDateString('en-gb', {
                year: 'numeric',
              })}
            </span>
          )}
        />
        <Table.Column
          title="Author(s)"
          dataIndex="authors"
          key="authors"
          render={(authors: Author[]) => authors.map(author => author.name).join(', ')}
        />
        <Table.Column title="Publisher" dataIndex="publisher" key="publisher" />
        <Table.Column
          title="Tags"
          dataIndex="tags"
          key="tags"
          render={tags => (
            <i>
              {(tags as TagType[]).map(({ name }) => (
                <Tag color="purple">{name}</Tag>
              ))}
            </i>
          )}
        />
      </Table>
    </div>
  );
};

export default MyBooks;
