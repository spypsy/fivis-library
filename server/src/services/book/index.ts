import axios from 'axios';
import { BookData, ResponseData } from './types';

const GOOGLE_BOOKS_API_BASE = 'https://www.googleapis.com';
const GOOGLE_BOOKS_API_BOOK = '/books/v1/volumes';

export async function getBookByIsbn(isbn: string): Promise<BookData> {
  const result = await axios.get<ResponseData>(`${GOOGLE_BOOKS_API_BASE + GOOGLE_BOOKS_API_BOOK}?q=isbn:${isbn}`);

  const responseBookData = result?.data?.items[0]?.volumeInfo;
  if (!responseBookData) {
    return { error: 'Not Found' };
  }

  return {
    title: responseBookData.title,
    authors: responseBookData.authors,
    publishedDate: responseBookData.publishedDate,
    description: responseBookData.description,
    pageCount: responseBookData.pageCount,
    printType: responseBookData.printType,
    categories: responseBookData.categories,
  };
}
