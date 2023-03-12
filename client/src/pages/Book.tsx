import useAxios from 'axios-hooks';
import React from 'react';
import { useParams } from 'react-router-dom';
import { Book as BookType } from 'types';

export const Book = () => {
  const { isbn } = useParams<{ isbn: string }>();
  const [{ data: bookData, loading, error }] = useAxios<BookType>({
    url: `/api/books/${isbn}`,
  });
  console.log(bookData);
  return <div>{isbn}</div>;
};
