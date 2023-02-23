import express from 'express';

import DB from '../db';

const router = express.Router();

export default (db: DB) => {
  router.get('/all', async (req, res) => {
    const authors = await db.getAllAuthors();
    res.send(authors);
  });

  return router;
};
