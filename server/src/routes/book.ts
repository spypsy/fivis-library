import express from 'express';

import DB from '../db';
import { UserDao } from '../db/models/User';
import { getBookByIsbn } from '../services/book';
import { BookData, UserEntryData } from '../services/book/types';

const router = express.Router();

type BookSubmitData = {
  bookData: BookData;
  userBookData: UserEntryData;
};

export default (db: DB) => {
  // store book
  router.post('/', async (req, res) => {
    const { bookData, userEntryData } = req.body;
    console.log('\nUSER', req.user, '\n');
    try {
      await db.addBook(bookData, userEntryData, req.user as UserDao);
    } catch (err) {
      return res.status(400).send(`Error storing book: ${err.message}`);
    }

    res.send(bookData);
  });

  router.post('/multi', async (req, res) => {
    const { booksData } = req.body;
    try {
      await db.addMultipleBooks(booksData, req.user as UserDao);
    } catch (err) {
      return res
        .status(400)
        .send(`Error storing multiple book: ${err.message}`);
    }
  });

  router.get('/hello', (req, res) => {
    res.send('hi from books API');
  });

  // get book data from external API
  router.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    let bookData;
    let title = '';

    try {
      bookData = await getBookByIsbn(isbn);
      title = bookData.title;
    } catch (err) {
      res
        .status(400)
        .send(`Error fetching ISBN: ${isbn}. Message: ${err.message}`);
    }
    if (!!title) {
      // try and get original publish date
      // const bookSearchResult = await
    }
    res.send(bookData);
  });

  router.get('/all', async (req, res) => {
    const books = await db.getAllBooks();
    res.send(books);
  });
  router.get('/:id', (req, res) => {
    const bookId = req.params.id;
    res.send();
  });

  // router.get('/all', async (req, res) => {

  return router;
};
