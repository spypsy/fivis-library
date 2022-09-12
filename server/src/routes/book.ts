import express from 'express';

import DB from '../db';

const router = express.Router();

export default (db: DB) => {
  router.post('/', async (req, res) => {
    const bookData = req.body;
    console.log(bookData);

    await db.addBook(bookData);

    res.send('thx for the book');
  });

  router.get('/', (req, res) => {
    res.send('hi');
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
