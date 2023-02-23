import express from 'express';
import bodyParser from 'body-parser';
import passport from 'passport';
import path from 'path';

import DB from './db';
import session from './session';
import book from './routes/book';
import auth from './routes/auth';
import author from './routes/author';

const clientPath = path.join(__dirname, '../../client/build');

async function main() {
  const app = express();

  const db = await DB.init();

  const bookRouter = book(db);
  const authorRouter = author(db);
  const authRouter = auth(db);

  app.use(bodyParser.json());
  app.use(session);
  app.use(passport.initialize());
  app.use(passport.session());
  // app.get('/', (req, res) => {
  //   res.send('Hello express');
  // });

  app.get('/api/hello', (req, res) => {
    res.status(200).send('hello there');
  });
  app.use('/api/books', bookRouter);
  app.use('/api/authors', authorRouter);
  app.use('/api/user', authRouter);

  app.use(express.static(clientPath));
  app.get('/', (req, res) => {
    res.sendFile('index.html', {
      root: clientPath,
      cacheControl: false,
    });
  });

  app.listen(8080);
}

main().catch((err) => {
  console.log('MAIN fn error: ', err);
  process.exit(1);
});
