import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import path from 'path';

import auth from './api/auth';
import author from './api/author';
import book from './api/book';
import DB, { DbSingleton } from './db';
import { tokenAuth } from './middleware/jwt';

const clientPath = path.join(__dirname, '../client-artifacts');

async function main() {
  const app = express();

  const db = await DbSingleton.get();

  const bookRouter = book(db);
  const authorRouter = author(db);
  const authRouter = auth(db);

  app.use(bodyParser.json());
  app.use(cookieParser());

  app.get('/api/hello', (req, res) => {
    res.status(200).send('hello there');
  });
  app.use('/api/books', tokenAuth, bookRouter);
  app.use('/api/authors', tokenAuth, authorRouter);
  app.use('/api/user', authRouter);
  app.use('/api/check-auth', tokenAuth, (req, res) => {
    return res.status(200);
  });

  app.use(express.static(clientPath));
  app.get('/*', (req, res) => {
    res.sendFile('index.html', {
      root: clientPath,
      cacheControl: false,
    });
  });
  app.listen(process.env.PORT || 8080);
}

main().catch(err => {
  console.log('MAIN fn error: ', err);
  process.exit(1);
});
