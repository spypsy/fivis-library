import express from 'express';

import DB from '../db';
import { UserAuthRequest } from '../middleware/jwt';
import { appendServerTiming, elapsedMs } from '../utils/serverTiming';

const router = express.Router();

export default (db: DB) => {
  router.get('/all', async (req: UserAuthRequest, res) => {
    const authors = await db.getAuthorSummariesForUser(req.user.id);
    res.send(authors);
  });

  router.get('/search', async (req: UserAuthRequest, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (q.length < 3) {
      return res.send([]);
    }

    const authors = await db.searchAuthorsByName(q);
    res.send(authors.map(author => ({ id: author.id, name: author.name })));
  });

  router.post('/', async (req: UserAuthRequest, res) => {
    const { name } = req.body;
    try {
      const author = await db.createAuthor(name);
      res.send({ id: author.id, name: author.name });
    } catch (err) {
      return res.status(400).send(err.message);
    }
  });

  router.get('/by-name/:name', async (req: UserAuthRequest, res) => {
    const name = decodeURIComponent(req.params.name);

    const authorLookupStart = performance.now();
    const author = await db.findAuthorByName(name);
    const authorLookupMs = elapsedMs(authorLookupStart);
    if (!author) {
      return res.status(404).send('Author not found');
    }

    const booksDbStart = performance.now();
    const userData = await db.loadUserBookEntriesForUser(req.user.id);
    const booksDbMs = elapsedMs(booksDbStart);

    const mapStart = performance.now();
    const allBooks = db.mapBookEntriesToUserBooks(userData);
    const mapMs = elapsedMs(mapStart);

    const filterStart = performance.now();
    const books = allBooks.filter(book => book.authors?.some(entry => entry.id === author.id));
    const filterMs = elapsedMs(filterStart);

    const jsonStart = performance.now();
    const body = JSON.stringify({ author, books });
    const jsonMs = elapsedMs(jsonStart);

    appendServerTiming(res, [
      { name: 'author_db', durMs: authorLookupMs },
      { name: 'books_db', durMs: booksDbMs },
      { name: 'map', durMs: mapMs },
      { name: 'filter', durMs: filterMs },
      { name: 'json', durMs: jsonMs },
    ]);
    res.type('json').send(body);
  });

  router.put('/:id', async (req: UserAuthRequest, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name?.trim()) {
      return res.status(400).send('Name is required');
    }

    try {
      const author = await db.updateAuthorName(id, name.trim());
      res.send(author);
    } catch (err) {
      return res.status(400).send(err.message);
    }
  });

  return router;
};
