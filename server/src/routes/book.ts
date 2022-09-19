import express from 'express';

import DB from '../db';
import { getBookByIsbn } from '../services/book';

const router = express.Router();

export default (db: DB) => {
  router.post('/', async (req, res) => {
    const bookData = req.body;

    await db.addBook(bookData);

    res.send(bookData);
  });

  router.get('/', (req, res) => {
    res.send('hi from books API');
  });

  router.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    console.log(isbn);
    const bookData = await getBookByIsbn(isbn);
    res.send(bookData);
  });

  router.get('/all', (req, res) => {
    console.log('all');
    res.send('all');
    // const books = await db.getAllBooks();
    // res.send(books);
  });
  router.get('/:id', (req, res) => {
    const bookId = req.params.id;
    res.send();
  });

  // router.get('/all', async (req, res) => {

  return router;
};
