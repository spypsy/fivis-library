import express from 'express';

import DB from '../db';
import { UserAuthRequest } from '../middleware/jwt';
import { LibraryContextRequest, requireOwnLibrary } from '../middleware/libraryContext';
import { getBookByIsbn } from '../services/book';
import { prepareUserBook } from './util';

const router = express.Router();

type RecommendationTagRequest = string | { name?: string };

const normalizeRecommendationTags = (tags: RecommendationTagRequest[]) =>
  tags.map(tag => (typeof tag === 'string' ? tag : tag.name || '')).filter(Boolean);

export default (db: DB) => {
  // store book
  router.post('/', requireOwnLibrary, async (req: UserAuthRequest, res) => {
    const { bookData, manual } = req.body;
    try {
      const result = await db.addBook(bookData, !!manual, req.user);
      res.send(result);
    } catch (err) {
      return res.status(400).send(`Error storing book: ${err.message}`);
    }
  });

  router.post('/multi', requireOwnLibrary, async (req: UserAuthRequest, res) => {
    const booksData = req.body;
    let result;
    try {
      result = await db.addMultipleBooks(booksData, req.user);
    } catch (err) {
      return res.status(400).send(`Error storing multiple book: ${err.message}`);
    }
    res.send(result);
  });

  router.get('/mine', async (req: LibraryContextRequest, res) => {
    const books = await db.getUserBooks(req.libraryUserId);
    res.send(books);
  });

  // get book data from external API
  router.get('/search-external/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    let bookData;

    try {
      bookData = await getBookByIsbn(isbn);
    } catch (err) {
      res.status(400).send(`Error fetching ISBN: ${isbn}. Message: ${err.message}`);
    }
    res.send(bookData);
  });

  router.get('/all', async (req, res) => {
    const books = await db.getAllBooks();
    res.send(books);
  });

  router.post('/search', async (req: LibraryContextRequest, res) => {
    const { search } = req.body;
    const books = await db.searchBooks(req.libraryUserId, search);
    res.send(books);
  });

  router.post('/random-recommendation', async (req: LibraryContextRequest, res) => {
    const tags = Array.isArray(req.body.tags) ? req.body.tags : [];
    const tagOperator = req.body.tagOperator === 'or' ? 'or' : 'and';
    const result = await db.getRandomBookRecommendation(
      req.libraryUserId,
      normalizeRecommendationTags(tags),
      tagOperator,
    );
    res.send(result);
  });

  router.get('/:isbn', async (req: LibraryContextRequest, res) => {
    const { isbn } = req.params;
    const book = await db.getBook(isbn);
    const bookEntry = await db.getBookEntry(req.libraryUserId, isbn);

    res.send(prepareUserBook(book, bookEntry));
  });

  router.put('/:isbn', requireOwnLibrary, async (req: UserAuthRequest, res) => {
    const { isbn } = req.params;
    const { bookData } = req.body;
    try {
      await db.updateBook(req.user.id, isbn, bookData);
    } catch (err) {
      return res.status(400).send(`Error updating book: ${err.message}`);
    }
    res.sendStatus(200);
  });

  router.delete('/:isbn', requireOwnLibrary, async (req: UserAuthRequest, res) => {
    const { isbn } = req.params;
    try {
      await db.deleteBookEntry(req.user.id, isbn);
    } catch (err) {
      return res.status(400).send(`Error deleting book: ${err.message}`);
    }
    res.sendStatus(200);
  });

  // router.get('/all', async (req, res) => {

  return router;
};
