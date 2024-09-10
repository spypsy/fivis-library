import { BookDao } from '../db/models/Book';
import { BookUserEntryDao } from '../db/models/BookUserEntry';

export const prepareUserBook = (bookData: BookDao, userEntry: Partial<BookUserEntryDao>) => {
  return {
    ...bookData,
    ...Object.fromEntries(Object.entries(userEntry).filter(([_, value]) => value !== null)),
  };
};
