import express from 'express';

import DB from '../db';
import { UserDao } from '../db/models/User';
import { UserAuthRequest } from '../middleware/jwt';
import { getBookByIsbn } from '../services/book';
import { BookData, UserEntryData } from '../services/book/types';

const router = express.Router();

export default (db: DB) => {
  // store book
  router.post('/', async (req: UserAuthRequest, res) => {
    const { bookData } = req.body;
    try {
      await db.addBook(bookData, req.user);
    } catch (err) {
      return res.status(400).send(`Error storing book: ${err.message}`);
    }

    res.send(bookData);
  });

  router.post('/multi', async (req: UserAuthRequest, res) => {
    const booksData = req.body;
    let numBooksAdded = 0;
    try {
      numBooksAdded = await db.addMultipleBooks(booksData, req.user);
    } catch (err) {
      return res.status(400).send(`Error storing multiple book: ${err.message}`);
    }
    res.send({ booksAdded: numBooksAdded });
  });

  router.get('/mine', async (req: UserAuthRequest, res) => {
    const books = await db.getUserBooks(req.user.id);
    res.send(books);
  });

  // get book data from external API
  router.get('/search-external/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    let bookData;
    let title = '';

    try {
      bookData = await getBookByIsbn(isbn);
      title = bookData.title;
    } catch (err) {
      res.status(400).send(`Error fetching ISBN: ${isbn}. Message: ${err.message}`);
    }
    res.send(bookData);
  });

  router.get('/all', async (req, res) => {
    const books = await db.getAllBooks();
    res.send(books);
  });

  router.get('/:isbn', async (req: UserAuthRequest, res) => {
    const { isbn } = req.params;
    const book = await db.getBook(isbn);
    const bookEntry = await db.getBookEntry(req.user.id, isbn);

    console.log('book');
    console.log(book);

    res.send({
      ...book,
      ...bookEntry,
    });
  });

  router.put('/:isbn', async (req: UserAuthRequest, res) => {
    const { isbn } = req.params;
    const { bookData } = req.body;
    const userId = (req.user || { username: 'fivi', id: '1' }).id;
    await db.updateBook(userId, isbn, bookData);

    res.send().status(200);
  });

  // router.get('/all', async (req, res) => {

  return router;
};
