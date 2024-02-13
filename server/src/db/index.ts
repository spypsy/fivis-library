import { DataSource, DataSourceOptions, Repository } from 'typeorm';

import { BookData, UserEntryData } from '../services/book/types';
import { AuthorDao } from './models/Author';
import { BookDao } from './models/Book';
import { BookUserEntryDao } from './models/BookUserEntry';
import { BookLendEntryDao } from './models/LendEntry';
import { TagDao } from './models/Tag';
import { UserDao } from './models/User';

let connectionOptions: DataSourceOptions;

type SearchFields = {
  any: string;
  title: string;
  subtitle: string;
  tags: string;
  authors: string;
  publisher: string;
  isbn: string;
  description: string;
};

enum AddedStatus {
  ADDED,
  ALREADY_EXISTS,
  ERROR,
}

connectionOptions = {
  type: 'sqlite',
  database: 'data/sqlite.db',
  synchronize: true,
  logging: false, //true,
  entities: [AuthorDao, BookDao, BookLendEntryDao, BookUserEntryDao, UserDao, TagDao],
  subscribers: [],
  migrations: [],
};

export class DbSingleton {
  private static instance: DB;

  private constructor() {}

  public static async get(): Promise<DB> {
    if (!DbSingleton.instance) {
      DbSingleton.instance = await DB.init();
    }

    return DbSingleton.instance;
  }
}

export default class DB {
  // private dataSource: DataSource;
  private userRep: Repository<UserDao>;
  private bookRep: Repository<BookDao>;
  private bookLendEntryRep: Repository<BookLendEntryDao>;
  private bookUserEntryRep: Repository<BookUserEntryDao>;
  private authorRep: Repository<AuthorDao>;
  private tagRep: Repository<TagDao>;
  private log = (txt: string) => console.log(`\n\n${txt}\n\n`);

  constructor(public dataSource: DataSource) {
    this.userRep = this.dataSource.getRepository(UserDao);
    this.bookRep = this.dataSource.getRepository(BookDao);
    this.bookUserEntryRep = this.dataSource.getRepository(BookUserEntryDao);
    this.authorRep = this.dataSource.getRepository(AuthorDao);
    this.tagRep = this.dataSource.getRepository(TagDao);
  }

  public static async init(): Promise<DB> {
    const dataSource = new DataSource(connectionOptions);
    await dataSource.initialize();
    const db = new DB(dataSource);

    return db;
  }

  public getDbDriver() {
    return this.dataSource.driver;
  }

  public async addMultipleBooks(booksData: { bookData: BookData & UserEntryData }[], user: UserDao) {
    let booksAdded = 0;
    // ISBNs of books that already exist in DB
    let duplicates: string[] = [];
    for (let i = 0; i < booksData.length; i++) {
      const { bookData } = booksData[i];
      const wasAdded = await this.addBook(bookData, user);
      if (wasAdded === AddedStatus.ADDED) {
        booksAdded++;
      } else if (wasAdded === AddedStatus.ALREADY_EXISTS) {
        duplicates.push(bookData.isbn);
      }
    }
    return { booksAdded, duplicates };
  }

  public async addBook(bookData: BookData & UserEntryData, user: UserDao) {
    let book: BookDao;
    // check if book already exists
    const existingBook = await this.getBook(bookData.isbn);
    if (existingBook) {
      const existingEntry = await this.bookUserEntryRep.findOne({
        where: {
          user: { id: user.id },
          book: { isbn: existingBook.isbn },
        },
      });
      if (existingEntry) {
        return AddedStatus.ALREADY_EXISTS;
      }

      book = existingBook;
    } else {
      book = new BookDao();
      book.isbn = bookData.isbn;
      book.title = bookData.title;
      book.subtitle = bookData.subtitle || 'N/A';
      book.description = bookData.description || 'N/A';
      book.pageCount = bookData.pageCount;
      book.publishedDate = bookData.publishedDate;
      book.publisher = bookData.publisher || 'N/A';
      book.language = bookData.language?.toString();
      book.imageLink = bookData.imageLinks?.thumbnail;
    }

    // create / fetch book authors
    const { authors } = bookData;
    let authorEntities: AuthorDao[] = [];
    // check if authors already exist
    // if not add them to DB
    if (authors.length) {
      for (const authorName of authors) {
        let author = await this.findAuthorByName(authorName);
        if (!author) {
          author = new AuthorDao();
          author.name = authorName;
        }
        authorEntities.push(author);
        this.log(`author: ${JSON.stringify(author)}`);
        this.log(`author.books: ${JSON.stringify(author.books)}`);
      }
    }
    book.authors = authorEntities;

    // handle tags; create new ones & fetch existing ones
    const appliedTags = bookData.tags;
    const existingTags = appliedTags.filter(tag => tag.id) as TagDao[];
    const newTags = appliedTags.filter(tag => !tag.id);
    let tagEntities: TagDao[] = [];
    for (const tag of newTags) {
      const newTag = new TagDao();
      newTag.name = tag.name;
      tagEntities.push(newTag);
      this.tagRep.save(newTag);
    }

    const tags = [...existingTags, ...tagEntities];

    // create user entry
    const userEntry = new BookUserEntryDao();
    userEntry.book = book;
    userEntry.tags = tags;
    userEntry.publisher = bookData.publisher;
    userEntry.user = user;
    userEntry.category = bookData.category;
    userEntry.subcategory = bookData.subcategory;
    userEntry.comment = bookData.comment;
    userEntry.rating = bookData.rating;
    userEntry.location = bookData.location;
    userEntry.originalLanguage = bookData.originalLanguage?.toString();
    userEntry.originalPublishedYear = bookData.originalPublishedYear;
    userEntry.addedAt = new Date();

    // append to book's user entires
    book.userEntries = [...(book.userEntries || []), userEntry];
    await this.bookRep.save(book);

    try {
      await this.bookUserEntryRep.save(userEntry);
    } catch (err) {
      console.log('err', err);
      return AddedStatus.ERROR;
    }
    return AddedStatus.ADDED;
  }

  public async getBook(isbn: string) {
    const book = await this.bookRep.findOneBy({ isbn });
    return book;
  }

  public async updateBook(userId: string, isbn: string, updateData: Partial<BookDao>) {
    const dbBookEntry = await this.getBookEntry(userId, isbn);
    if (!dbBookEntry) {
      throw new Error('No book to update.');
    }
    const updatedBookEntry = {
      ...dbBookEntry,
      ...updateData,
    };

    await this.bookUserEntryRep.save(updatedBookEntry);
  }

  public async getBookEntry(userId: string, isbn: string) {
    const entry = await this.bookUserEntryRep.findOne({
      where: {
        user: { id: userId },
        book: { isbn },
      },
      relations: ['tags'],
    });
    return entry;
  }

  public async getUserBooks(userId: string) {
    const userData = await this.userRep.findOne({
      where: { id: userId },
      relations: { bookEntries: { book: true, user: true, tags: true } },
    });
    const result = userData.bookEntries.map(({ book, ...entry }) => ({ ...entry, ...book }));
    return result;
  }

  public async searchBooks(userId: string, search: SearchFields) {}

  public async getAllBooks() {
    const books = await this.bookRep.find();
    return books;
  }

  public async getAllAuthors() {
    const authors = await this.authorRep.find();
    return authors;
  }

  public async findAuthorByName(name: string) {
    const author = await this.authorRep.findOneBy({ name });
    return author;
  }

  public async createUser(userData: UserDao) {
    await this.userRep.save(userData);
  }

  public async findUserByUsername(username: string): Promise<UserDao> {
    const user = await this.userRep.findOneBy({ username });
    return user;
  }

  public async getUserById(id: number): Promise<UserDao> {
    const user = await this.userRep.findOneBy({ id: id.toString() });
    return user;
  }

  public async getTags() {
    const tags = await this.tagRep.find();
    return tags;
  }
}
