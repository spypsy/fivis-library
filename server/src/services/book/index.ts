import axios from 'axios';

import { BookData, ResponseData } from './types';

const GOOGLE_BOOKS_API_BASE = 'https://www.googleapis.com';
const GOOGLE_BOOKS_API_BOOK = '/books/v1/volumes';

export async function getBookByIsbn(isbn: string): Promise<BookData> {
  const digitsOnlyRegex = /^[0-9]*$/;
  const match = isbn.match(digitsOnlyRegex);

  if (!match) {
    throw Error(`Invalid ISBN input: ${isbn}`);
  }

  const result = await axios.get<ResponseData>(`${GOOGLE_BOOKS_API_BASE + GOOGLE_BOOKS_API_BOOK}?q=isbn:${isbn}`);

  console.log('result', result.data);

  if (result.data.totalItems === 0 || !result?.data?.items[0]?.volumeInfo) {
    throw Error('Not Found');
  }

  const responseBookData = result?.data?.items?.[0]?.volumeInfo;
  return {
    id: result?.data?.items[0]?.id,
    isbn:
      responseBookData.industryIdentifiers.find(({ type }) => type === 'ISBN_13' || type === 'ISBN_10')?.identifier ||
      isbn,
    title: responseBookData.title,
    subtitle: responseBookData.subtitle,
    authors: responseBookData.authors,
    publishedDate: responseBookData.publishedDate,
    publisher: responseBookData.publisher,
    description: responseBookData.description,
    pageCount: responseBookData.pageCount,
    printType: responseBookData.printType,
    categories: responseBookData.categories,
    language: responseBookData.language,
    imageLinks: responseBookData.imageLinks,
  };
}

export async function searchBookByTitle(title: string) {}
