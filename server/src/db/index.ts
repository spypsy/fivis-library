import { DataSource, Repository, In } from 'typeorm';
import crypto from 'crypto';
import { AuthorDao } from './models/Author';
import { BookDao } from './models/Book';
import { BookLendEntryDao } from './models/LendEntry';
import { UserDao, UserType } from './models/User';
import { BookUserEntryDao } from './models/BookUserEntry';
import { BookData, UserEntryData } from '../services/book/types';

export default class DB {
  // private dataSource: DataSource;
  private userRep: Repository<UserDao>;
  private bookRep: Repository<BookDao>;
  private bookLendEntryRep: Repository<BookLendEntryDao>;
  private bookUserEntryRep: Repository<BookUserEntryDao>;
  private authorRep: Repository<AuthorDao>;
  private log = (txt: string) => console.log(`\n\n${txt}\n\n`);

  constructor(private dataSource: DataSource) {
    this.userRep = this.dataSource.getRepository(UserDao);
    this.bookRep = this.dataSource.getRepository(BookDao);
    this.bookUserEntryRep = this.dataSource.getRepository(BookUserEntryDao);
    this.authorRep = this.dataSource.getRepository(AuthorDao);
  }

  public static async init(): Promise<DB> {
    const dataSource = new DataSource({
      type: 'sqlite',
      database: 'data/sqlite.db',
      synchronize: true,
      logging: true,
      entities: [
        AuthorDao,
        BookDao,
        BookLendEntryDao,
        BookUserEntryDao,
        UserDao,
      ],
      subscribers: [],
      migrations: [],
    });
    await dataSource.initialize();
    const db = new DB(dataSource);

    // add foivi if she doesn't exist
    const salt = crypto.randomBytes(16);
    const fivi = await db.findUserByUsername('fivi');
    if (!fivi) {
      await db.createUser({
        username: 'fivi',
        firstName: 'fivi',
        lastName: 'theocharaki',
        email: 'th.phoebe@gmail.com',
        userType: UserType.READER,
        password: crypto.pbkdf2Sync('vivlia', salt, 310000, 32, 'sha256'),
        salt,
      });
    }

    return db;
  }

  public getDbDriver() {
    return this.dataSource.driver;
  }

  public async addMultipleBooks(
    booksData: { bookData: BookData & UserEntryData }[],
    user: UserDao = { username: 'fivi', id: '1' },
  ) {
    let booksAdded = 0;
    for (let i = 0; i < booksData.length; i++) {
      const { bookData } = booksData[i];
      const wasAdded = await this.addBook(bookData, user);
      if (wasAdded) {
        booksAdded++;
      }
    }
    return booksAdded;
  }

  public async addBook(bookData: BookData & UserEntryData, user: UserDao) {
    let book: BookDao;
    // check if book already exists
    const existingBook = await this.getBook(bookData.isbn);
    if (existingBook) {
      console.log('book exists: ', existingBook);
      const existingEntry = await this.bookUserEntryRep.findOne({
        where: {
          user: user,
          book: existingBook,
        },
      });
      this.log(`existing entry: ${JSON.stringify(existingEntry)}`);
      if (existingEntry) {
        return false;
      }

      book = existingBook;
    } else {
      book = new BookDao();
      book.isbn = bookData.isbn;
      book.title = bookData.title;
      book.subtitle = bookData.subtitle;
      book.description = bookData.description;
      book.pageCount = bookData.pageCount;
      book.publishedDate = bookData.publishedDate;
      book.language = bookData.language;
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

    // create user entry
    const userEntry = new BookUserEntryDao();
    userEntry.book = book;
    userEntry.user = user;
    userEntry.category = bookData.category;
    userEntry.subcategory = bookData.subcategory;
    userEntry.comment = bookData.comment;
    userEntry.rating = bookData.rating;
    userEntry.location = bookData.location;
    userEntry.originalLanguage = bookData.originalLanguage;
    userEntry.originalPublishedYear = bookData.originalPublishedYear;
    userEntry.addedAt = new Date();

    // append to book's user entires
    book.userEntries = [...(book.userEntries || []), userEntry];
    await this.bookRep.save(book);

    try {
      await this.bookUserEntryRep.save(userEntry);
    } catch (err) {
      console.log('err', err);
      return false;
    }
    return true;
  }

  public async getBook(isbn: string) {
    const book = await this.bookRep.findOneBy({ isbn });
    console.log('\n\n', book, '\n\n');
    return book;
  }

  public async updateBook(
    userId: string,
    isbn: string,
    updateData: Partial<BookDao>,
  ) {
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
    });
    return entry;
  }

  public async getUserBooks(userId: string) {
    const userData = await this.userRep.findOne({
      where: { id: userId },
      relations: { bookEntries: { book: true, user: true } },
    });
    const dbBooks = userData.bookEntries.map(({ book }) => book);
    // const books =
    return dbBooks;
  }

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
}
