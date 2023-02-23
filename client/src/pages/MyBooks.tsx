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
      <ul>{booksData?.map((obj: Book) => JSON.stringify(obj))}</ul>
    </div>
  );
};

export default MyBooks;
