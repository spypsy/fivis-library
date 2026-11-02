import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

import { DbSingleton } from '../db';
import { UserDao } from '../db/models/User';

// Route params are plain strings: no route here uses an Express 5 wildcard (which yields string[]).
export interface UserAuthRequest extends Request<Record<string, string>> {
  user: UserDao; // or any other type
}
export function tokenAuth(req: UserAuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies.token;

  if (!token) {
    console.log('no token');
    return res.sendStatus(401);
  }

  jwt.verify(token, (process.env.JWT_SECRET || 'foobar_jwt') as string, (err: any, user: any) => {
    if (err) {
      console.log('jwt verify failed');
      return res.sendStatus(403);
    }

    // Handle async operations outside of jwt.verify callback
    async function fetchUser() {
      try {
        const db = await DbSingleton.get();
        req.user = await db.getUserById(user.userId);
        next();
      } catch (error) {
        console.error('Database operation failed', error);
        return res.sendStatus(500);
      }
    }

    fetchUser();
  });
}
