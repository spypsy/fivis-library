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
    booksData: { bookData: BookData; userEntryData?: UserEntryData }[],
    user: UserDao = { username: 'fivi', id: '1' },
  ) {
    let booksAdded = 0;
    for (let i = 0; i < booksData.length; i++) {
      const { bookData, userEntryData } = booksData[i];
      const wasAdded = await this.addBook(bookData, userEntryData, user);
      if (wasAdded) {
        booksAdded++;
      }
    }
    return booksAdded;
  }

  public async addBook(
    bookData: BookData,
    userEntryData: UserEntryData,
    user: UserDao,
  ) {
    let book: BookDao;
    // check if book already exists
    const existingBook = await this.getBook(bookData.isbn);
    if (existingBook) {
      book = existingBook;
    } else {
      book = new BookDao();
      book.isbn = bookData.isbn;
      book.title = bookData.title;
      book.subtitle = bookData.subtitle;
      book.pageCount = bookData.pageCount;
      book.publishedDate = bookData.publishedDate;
      book.language = bookData.language;
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
        author.books = [...(author.books || []), book];
        authorEntities.push(author);
      }
    }
    book.authors = authorEntities;

    // create user entry
    const userEntry = new BookUserEntryDao();
    userEntry.book = book;
    userEntry.user = user;
    if (userEntryData) {
      userEntry.category = userEntryData.category;
      userEntry.subcategory = userEntryData.subcategory;
      userEntry.comment = userEntryData.comment;
      userEntry.rating = userEntryData.rating;
      userEntry.location = userEntryData.location;
    }
    userEntry.addedAt = new Date();

    // append to book's user entires
    book.userEntries = [...(book.userEntries || []), userEntry];

    try {
      await this.bookRep.save(book);
      // await this.bookRep.save
    } catch (err) {
      console.log('err', err);
      return false;
    }
    return true;
  }

  public async getBook(isbn: string) {
    const book = await this.bookRep.findOneBy({ isbn });
    return book;
  }

  public async getUserBooks(userId: string) {
    console.log('here');
    const userData = await this.userRep.findOne({
      where: { id: userId },
      relations: { bookEntries: { book: true, user: true } },
    });
    console.log(userData.bookEntries.map(({ book }) => book));
    return userData.bookEntries.map(({ book }) => book);
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
