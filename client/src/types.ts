export type User = {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  userType?: UserType;
};

export type Book = {
  isbn?: string;
  title?: string;
  authors?: string[];
  publishedDate?: string;
};

export enum UserType {
  ADMIN,
  READER,
}
