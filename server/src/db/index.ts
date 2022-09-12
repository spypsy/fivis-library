import { DataSource, Repository } from 'typeorm';
import crypto from 'crypto';
import { AuthorDao } from './models/Author';
import { BookDao } from './models/Book';
import { BookLendEntryDao } from './models/LendEntry';
import { UserDao, UserType } from './models/User';
import { BookUserEntryDao } from './models/UserEntry';

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
    this.authorRep = this.dataSource.getRepository(AuthorDao);
  }

  public static async init(): Promise<DB> {
    const dataSource = new DataSource({
      type: 'sqlite',
      database: 'data/sqlite.db',
      synchronize: true,
      logging: true,
      entities: [AuthorDao, BookDao, BookLendEntryDao, BookUserEntryDao, UserDao],
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

  public async addBook(book: BookDao) {
    const { authors } = book;
    // check if authors already exist
    if (authors.length) {
    }

    await this.bookRep.save(book);
  }

  public async getAllBooks() {
    const books = await this.bookRep.find();
    return books;
  }

  public async createUser(userData: UserDao) {
    await this.userRep.save(userData);
  }

  public async findUserByUsername(username: string): Promise<UserDao> {
    const user = await this.userRep.findOneBy({ username });
    return user;
  }
}
