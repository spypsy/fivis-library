import { DataSource, DataSourceOptions, Repository } from 'typeorm';

import { prepareUserBook } from '../api/util';
import { BookData, Tag, UserEntryData } from '../services/book/types';
import { AuthorDao } from './models/Author';
import { BookDao } from './models/Book';
import { BookUserEntryDao } from './models/BookUserEntry';
import { BookLendEntryDao } from './models/LendEntry';
import { TagDao } from './models/Tag';
import { UserDao } from './models/User';

let connectionOptions: DataSourceOptions;

type SearchProperty = 'any' | 'title' | 'subtitle' | 'tags' | 'authors' | 'publisher' | 'isbn' | 'description';

const searchProperties = ['any', 'title', 'subtitle', 'tags', 'authors', 'publisher', 'isbn', 'description'];

type SearchTerm = {
  value: string;
  property: SearchProperty;
  operator: string;
};

type RandomBookTagOperator = 'and' | 'or';

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
    // Error strings
    let errors: string[] = [];
    for (let i = 0; i < booksData.length; i++) {
      const { bookData } = booksData[i];
      const [wasAdded, error] = await this.addBook(bookData, false, user);
      if (wasAdded === AddedStatus.ADDED) {
        booksAdded++;
      } else if (wasAdded === AddedStatus.ALREADY_EXISTS) {
        duplicates.push(bookData.isbn);
      } else if (wasAdded === AddedStatus.ERROR) {
        errors.push(error);
      }
    }
    return { booksAdded, duplicates, errors };
  }

  public async deduplicateTags() {
    const allTags = await this.tagRep.find();
    const tagsToDelete: TagDao[] = [];
    const tagsToKeep: TagDao[] = [];
    allTags.forEach(tag => {
      if (tagsToKeep.some(t => t.name === tag.name)) {
        tagsToDelete.push(tag);
      } else {
        tagsToKeep.push(tag);
      }
    });
    await this.tagRep.remove(tagsToDelete);
  }

  public async addBook(
    bookData: BookData & UserEntryData,
    isManual: boolean,
    user: UserDao,
  ): Promise<[AddedStatus, string]> {
    let book: BookDao;
    // check if book already exists
    const existingBook = await this.getBook(bookData.isbn);

    if (isManual) {
      if (existingBook) {
        throw new Error(`ISBN already exists for book: ${existingBook.title}`);
      } else if (!bookData.isbn) {
        let randomIsbn = '';
        for (let i = 0; i < 10; i++) {
          randomIsbn += Math.floor(Math.random() * 10);
        }
        bookData.isbn = randomIsbn;
      }
    }

    if (existingBook) {
      const existingEntry = await this.bookUserEntryRep.findOne({
        where: {
          user: { id: user.id },
          book: { isbn: existingBook.isbn },
        },
      });
      if (existingEntry) {
        return [AddedStatus.ALREADY_EXISTS, ''];
      }

      book = existingBook;
    } else {
      console.log('bookData', bookData);
      if (!bookData.isbn) {
        return [AddedStatus.ERROR, `${bookData.title}: no ISBN.`];
      }

      if (!bookData.authors?.length) {
        return [AddedStatus.ERROR, `${bookData.title}: no authors.`];
      }

      if (!bookData.title) {
        return [AddedStatus.ERROR, `${bookData.title}: no title.`];
      }

      if (!bookData.publishedDate) {
        return [AddedStatus.ERROR, `${bookData.title}: no published date.`];
      }

      if (!bookData.language) {
        return [AddedStatus.ERROR, `${bookData.title}: no language.`];
      }

      book = new BookDao();
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

    const authorInputs = this.normalizeAuthorInputs(bookData.authors || []);
    book.authors = authorInputs.length ? await this.resolveAuthorEntries(authorInputs) : [];

    const tags = await this.handleTags(bookData.tags);

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
      return [AddedStatus.ERROR, ''];
    }

    return [AddedStatus.ADDED, ''];
  }

  public async getBook(isbn: string) {
    const book = await this.bookRep.findOneBy({ isbn });
    return book;
  }

  public async updateBook(
    userId: string,
    isbn: string,
    updateData: Partial<BookUserEntryDao> & { authors?: { id?: string; name: string }[]; title?: string },
  ) {
    const dbBookEntry = await this.getBookEntry(userId, isbn);
    if (!dbBookEntry) {
      throw new Error('No book to update.');
    }

    if (updateData.authors) {
      await this.setBookAuthors(isbn, updateData.authors);
    }

    if (updateData.title !== undefined) {
      const book = await this.getBook(isbn);
      if (book) {
        book.title = updateData.title;
        await this.bookRep.save(book);
      }
    }

    const entryUpdate = { ...updateData };
    delete entryUpdate.authors;
    delete entryUpdate.title;

    if (entryUpdate.tags) {
      const tags = await this.handleTags(entryUpdate.tags);
      entryUpdate.tags = tags;
    }

    const updatedBookEntry = {
      ...dbBookEntry,
      ...entryUpdate,
    };

    await this.bookUserEntryRep.save(updatedBookEntry);
  }

  public async searchAuthorsByName(query: string, limit = 20) {
    return this.authorRep
      .createQueryBuilder('author')
      .where('author.name LIKE :query', { query: `%${query}%` })
      .orderBy('author.name', 'ASC')
      .take(limit)
      .getMany();
  }

  public async createAuthor(name: string) {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error('Name is required');
    }

    const existing = await this.findAuthorByName(trimmed);
    if (existing) {
      throw new Error('An author with that name already exists.');
    }

    const author = new AuthorDao();
    author.name = trimmed;
    await this.authorRep.save(author);
    return author;
  }

  private async resolveAuthorEntries(authors: { id?: string; name: string }[]): Promise<AuthorDao[]> {
    const authorEntities: AuthorDao[] = [];
    for (const author of authors) {
      if (author.id) {
        const byId = await this.findAuthorById(author.id);
        if (byId) {
          authorEntities.push(byId);
          continue;
        }
      }

      let entity = await this.findAuthorByName(author.name);
      if (!entity) {
        entity = new AuthorDao();
        entity.name = author.name;
      }
      authorEntities.push(entity);
    }
    return authorEntities;
  }

  private normalizeAuthorInputs(
    authors: (string | { id?: string; name: string })[],
  ): { id?: string; name: string }[] {
    return authors.map(author => {
      if (typeof author === 'string') {
        return { name: author };
      }
      return { id: author.id, name: author.name };
    });
  }

  private async setBookAuthors(isbn: string, authors: { id?: string; name: string }[]) {
    const book = await this.bookRep.findOne({
      where: { isbn },
      relations: ['authors'],
    });
    if (!book) {
      throw new Error('Book not found.');
    }

    book.authors = await this.resolveAuthorEntries(authors);
    await this.bookRep.save(book);
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
    const result = userData.bookEntries.map(({ book, ...entry }) => ({
      ...prepareUserBook(book, entry),
    }));

    return result;
  }

  public async searchBooks(userId: string, searchTerms: SearchTerm[]) {
    const activeTerms = searchTerms.filter(term => term.value?.trim());
    if (!activeTerms.length) {
      return [];
    }

    let query = this.bookUserEntryRep
      .createQueryBuilder('user_entry')
      .leftJoinAndSelect('user_entry.book', 'book')
      .leftJoinAndSelect('book.authors', 'author')
      .leftJoinAndSelect('user_entry.tags', 'tag')
      .where('user_entry.user.id = :userId', { userId });

    activeTerms.forEach((term, index) => {
      let whereClause = '';
      const parameter = `%${term.value.trim()}%`;

      if (term.property === 'any') {
        whereClause = `(book.title LIKE :parameter OR book.subtitle LIKE :parameter OR book.description LIKE :parameter OR book.publisher LIKE :parameter OR book.isbn LIKE :parameter OR author.name LIKE :parameter OR tag.name LIKE :parameter)`;
      } else if (
        term.property === 'title' ||
        term.property === 'subtitle' ||
        term.property === 'publisher' ||
        term.property === 'isbn' ||
        term.property === 'description'
      ) {
        whereClause = `book.${term.property} LIKE :parameter`;
      } else if (term.property === 'tags') {
        whereClause = `tag.name LIKE :parameter`;
      } else if (term.property === 'authors') {
        whereClause = `author.name LIKE :parameter`;
      } else {
        return;
      }

      const paramKey = `parameter${index}`;

      if (index === 0) {
        query = query.andWhere(whereClause.replace(':parameter', `:${paramKey}`), { [paramKey]: parameter });
      } else if (term.operator === 'or') {
        query = query.orWhere(whereClause.replace(':parameter', `:${paramKey}`), { [paramKey]: parameter });
      } else if (term.operator === 'not') {
        query = query.andWhere(`NOT (${whereClause.replace(':parameter', `:${paramKey}`)})`, {
          [paramKey]: parameter,
        });
      } else {
        query = query.andWhere(whereClause.replace(':parameter', `:${paramKey}`), { [paramKey]: parameter });
      }
    });

    const entries = await query.getMany();
    return entries.map(({ book, ...entry }) => ({
      ...prepareUserBook(book, entry),
    }));
  }

  public async getRandomBookRecommendation(userId: string, tagNames: string[], tagOperator: RandomBookTagOperator) {
    const userBooks = await this.getUserBooks(userId);
    const activeTagNames = tagNames.map(tagName => tagName.trim()).filter(Boolean);
    const matchedBooks = activeTagNames.length
      ? userBooks.filter(book => {
          const bookTags = (book as { tags?: Tag[] }).tags || [];
          const bookTagNames = bookTags.map(tag => tag.name);
          if (tagOperator === 'or') {
            return activeTagNames.some(tagName => bookTagNames.indexOf(tagName) >= 0);
          }
          return activeTagNames.every(tagName => bookTagNames.indexOf(tagName) >= 0);
        })
      : userBooks;

    const book = matchedBooks[Math.floor(Math.random() * matchedBooks.length)];
    return { book, totalMatches: matchedBooks.length };
  }

  public async deleteBookEntry(userId: string, isbn: string) {
    const bookEntry = await this.getBookEntry(userId, isbn);
    if (!bookEntry) {
      throw new Error('No book to delete.');
    }

    // Remove related tags (many-to-many relationship)
    bookEntry.tags = [];

    // Remove related lend entries (one-to-many relationship)
    if (bookEntry.lendEntries) {
      await this.bookLendEntryRep.remove(bookEntry.lendEntries);
    }

    // Remove the book entry
    await this.bookUserEntryRep.remove(bookEntry);
  }

  public async getAllBooks() {
    const books = await this.bookRep.find();
    return books;
  }

  public async getAllAuthors() {
    const authors = await this.authorRep.find();
    return authors;
  }

  public async getAuthorSummariesForUser(userId: string) {
    const userData = await this.userRep.findOne({
      where: { id: userId },
      relations: { bookEntries: { book: { authors: true } } },
    });
    if (!userData?.bookEntries?.length) {
      return [];
    }

    const summaries = new Map<
      string,
      { id: string; name: string; bookCount: number; lastUpdated?: Date }
    >();

    for (const entry of userData.bookEntries) {
      for (const author of entry.book?.authors || []) {
        const existing = summaries.get(author.id);
        if (!existing) {
          summaries.set(author.id, {
            id: author.id,
            name: author.name,
            bookCount: 1,
            lastUpdated: entry.addedAt,
          });
        } else {
          existing.bookCount += 1;
          if (entry.addedAt && (!existing.lastUpdated || entry.addedAt > existing.lastUpdated)) {
            existing.lastUpdated = entry.addedAt;
          }
        }
      }
    }

    return Array.from(summaries.values()).map(summary => ({
      id: summary.id,
      name: summary.name,
      bookCount: summary.bookCount,
      lastUpdated: summary.lastUpdated?.toISOString(),
    }));
  }

  public async findAuthorByName(name: string) {
    const author = await this.authorRep.findOneBy({ name });
    return author;
  }

  public async findAuthorById(id: string) {
    const author = await this.authorRep.findOneBy({ id });
    return author;
  }

  public async getUserBooksByAuthor(userId: string, authorId: string) {
    const books = await this.getUserBooks(userId);
    return books.filter(book => book.authors?.some(author => author.id === authorId));
  }

  public async updateAuthorName(id: string, name: string) {
    const author = await this.authorRep.findOneBy({ id });
    if (!author) {
      throw new Error('Author not found.');
    }

    const duplicate = await this.authorRep.findOneBy({ name });
    if (duplicate && duplicate.id !== id) {
      throw new Error('An author with that name already exists.');
    }

    author.name = name;
    await this.authorRep.save(author);
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

  private async handleTags(bookDataTags: Tag[]) {
    // handle tags; create new ones & fetch existing ones
    const appliedTags = bookDataTags || [];
    const existingTags: TagDao[] = []; //= appliedTags.filter(tag => tag.id) as TagDao[];
    let newTags = [];
    for (const tag of appliedTags) {
      const dbTag = await this.tagRep.findOneBy({ name: tag.name });
      if (!dbTag) {
        newTags.push(tag);
      } else {
        existingTags.push(dbTag);
      }
    }
    let tagEntities: TagDao[] = [];
    for (const tag of newTags) {
      const newTag = new TagDao();
      newTag.name = tag.name;
      const dbTag = await this.tagRep.save(newTag);
      tagEntities.push(dbTag);
    }

    const tags = [...existingTags, ...tagEntities];
    return tags;
  }
}
