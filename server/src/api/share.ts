import express from 'express';

import DB from '../db';
import { UserAuthRequest } from '../middleware/jwt';

const router = express.Router();

export default (db: DB) => {
  router.get('/', async (req: UserAuthRequest, res) => {
    const sharedByMe = await db.getSharesByOwner(req.user.id);
    const sharedWithMe = await db.getSharesWithUser(req.user.id);
    res.send({ sharedByMe, sharedWithMe });
  });

  router.post('/', async (req: UserAuthRequest, res) => {
    const username = typeof req.body?.username === 'string' ? req.body.username : '';
    if (!username.trim()) {
      return res.status(400).send('Username is required');
    }

    try {
      const sharedWith = await db.createShare(req.user.id, username);
      res.status(201).send(sharedWith);
    } catch (err) {
      return res.status(400).send(err.message);
    }
  });

  router.delete('/:userId', async (req: UserAuthRequest, res) => {
    const { userId } = req.params;
    const revoked = await db.revokeShare(req.user.id, userId);
    if (!revoked) {
      return res.status(404).send('Share not found');
    }
    res.sendStatus(200);
  });

  return router;
};
