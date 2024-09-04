import { languages } from 'countries-list';

export type LangEnum = keyof typeof languages;

export type UserBook = Book & UserEntryFields;

export type Tag = {
  id?: string;
  name: string;
};

export type User = {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  userType?: UserType;
};

export type Book = {
  isbn: string;
  title?: string;
  subtitle?: string;
  description?: string;
  authors?: Author[];
  publisher: string;
  publishedDate?: string;
  imageLinks: ImageLinks;
  imageLink?: string;
  language: LangEnum;
  tags?: Tag[];
};

export type UserEntryFields = {
  publisher?: string;
  subtitle?: string;
  comment?: string;
  originalPublishedYear?: number;
  originalLanguage?: LangEnum;
  addedAt?: Date;
  tags?: Tag[];
  rating?: number;
};

export type BookSaveData = {
  booksAdded: number;
  duplicates: string[];
};

export type Author = {
  name: string;
  id: number;
};

export type ImageLinks = {
  smallThumbnail: string;
  thumbnail: string;
};

export enum UserType {
  ADMIN,
  READER,
}
