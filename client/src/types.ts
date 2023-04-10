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
  publishedDate?: string;
  imageLinks: ImageLinks;
  imageLink?: string;
  language: string;

  // USER EDIT FIELDS
  comment?: string;
};

export type BookSaveData = {
  booksAdded: number;
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
