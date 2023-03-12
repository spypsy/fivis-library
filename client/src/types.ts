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
  authors?: Author[];
  publishedDate?: string;
  imageLinks: ImageLinks;
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
