import { Table } from 'antd';
import useAxios from 'axios-hooks';
import React from 'react';
import { Book } from 'types';

const MyBooks = () => {
  const [{ data: booksData, loading, error }] = useAxios({
    url: '/api/books/mine',
  });
  console.log(booksData);
  return (
    <div>
      {/* <ul>{booksData?.map((obj: Book) => JSON.stringify(obj))}</ul> */}
      <Table dataSource={booksData}>
        <Table.Column title="Title" dataIndex="title" key="title" />
      </Table>
    </div>
  );
};

export default MyBooks;
