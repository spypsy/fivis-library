import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import path from 'path';

import auth from './api/auth';
import author from './api/author';
import book from './api/book';
import share from './api/share';
import { DbSingleton } from './db';
import { tokenAuth } from './middleware/jwt';
import { libraryContext } from './middleware/libraryContext';

const clientPath = path.join(__dirname, '../../client/build');

async function main() {
  const app = express();

  const db = await DbSingleton.get();

  const bookRouter = book(db);
  const authorRouter = author(db);
  const authRouter = auth(db);
  const shareRouter = share(db);
  const corsOptions = {
    origin:
      process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'development'
        ? ['http://localhost:3000', 'http://localhost:8080', 'http://localhost']
        : 'http://fivislibrary.com',
    credentials: true,
  };
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(cookieParser());

  app.get('/api/hello', (req, res) => {
    res.status(200).send('hello there');
  });
  app.use('/api/books', tokenAuth, libraryContext, bookRouter);
  app.use('/api/authors', tokenAuth, libraryContext, authorRouter);
  app.use('/api/shares', tokenAuth, shareRouter);
  app.use('/api/user', authRouter);
  app.use('/api/check-auth', tokenAuth, (req, res) => {
    return res.status(200).send();
  });
  app.use('/api/tags', tokenAuth, async (req, res) => {
    const tags = (await db.getTags()) || [];
    res.send(tags);
  });

  app.use(express.static(clientPath));
  app.get('/{*splat}', (req, res) => {
    res.sendFile('index.html', {
      root: clientPath,
      cacheControl: false,
    });
  });

  // Last-resort handler: Express 5 forwards errors thrown in async routes here.
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(`${req.method} ${req.originalUrl} failed`, err);
    if (res.headersSent) {
      return next(err);
    }
    res.status(500).send('Something went wrong');
  });
  app.listen(process.env.PORT || 8080);
}

main().catch(err => {
  console.log('MAIN fn error: ', err);
  process.exit(1);
});
