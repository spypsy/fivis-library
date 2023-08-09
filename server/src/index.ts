import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import path from 'path';

import DB from './db';
import { tokenAuth } from './middleware/jwt';
import auth from './routes/auth';
import author from './routes/author';
import book from './routes/book';

const clientPath = path.join(__dirname, '../client-artifacts');

async function main() {
  const app = express();

  const db = await DB.init();

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
