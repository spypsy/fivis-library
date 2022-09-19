import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from 'passport';
import axios from 'axios';
import sqliteStoreFactory from 'express-session-sqlite';
import * as sqlite3 from 'sqlite3';
import path from 'path';

import DB from './db';
import { getBookByIsbn } from './services/book';
import book from './routes/book';
import auth from './routes/auth';

const clientPath = path.join(__dirname, '../../client/build');

const SqliteStore = sqliteStoreFactory(session);

async function main() {
  const app = express();

  const db = await DB.init();

  const bookRouter = book(db);
  const authRouter = auth(db);

  const sqliteDbDriver = db.getDbDriver();

  app.use(bodyParser.json());
  app.use(
    session({
      secret: 'wookiee doggo',
      resave: false,
      saveUninitialized: false,
      store: new SqliteStore({
        // Database library to use. Any library is fine as long as the API is compatible
        // with sqlite3, such as sqlite3-offline
        driver: sqlite3.Database,
        // for in-memory database
        // path: ':memory:'
        path: 'data/sqlite.db',
        // Session TTL in milliseconds
        ttl: 1234,
        // (optional) Session id prefix. Default is no prefix.
        prefix: 'sess:',
        // (optional) Adjusts the cleanup timer in milliseconds for deleting expired session rows.
        // Default is 5 minutes.
        cleanupInterval: 300000,
      }),
    }),
  );
  app.use(passport.authenticate('session'));

  // app.get('/', (req, res) => {
  //   res.send('Hello express');
  // });

  app.get('/api/hello', (req, res) => {
    res.status(200).send('hello there');
  });

  app.get('/api/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    const bookData = await getBookByIsbn(isbn);
    res.send(bookData);
  });

  app.use(express.static(clientPath));

  app.get('/', (req, res) => {
    res.sendFile('index.html', {
      root: clientPath,
      cacheControl: false,
    });
  });

  app.use('/api/books', bookRouter);
  app.use('/api/user', authRouter);

  app.listen(8080);
}

main().catch((err) => {
  console.log('MAIN fn error: ', err);
  process.exit(1);
});
