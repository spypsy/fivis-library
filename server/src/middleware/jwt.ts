import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

import { DbSingleton } from '../db';
import { UserDao } from '../db/models/User';

export interface UserAuthRequest extends Request {
  user: UserDao; // or any other type
}

export function tokenAuth(req: UserAuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies.token;

  if (token == null) {
    console.log('no token');
    return res.sendStatus(401); // if there isn't any token
  }

  jwt.verify(token, process.env.JWT_SECRET as string, async (err: any, user: any) => {
    if (err) {
      console.log('jwt verify failed');
      return res.sendStatus(403);
    }
    const db = await DbSingleton.get();
    req.user = await db.getUserById(user.userId);
    next(); // pass the execution off to whatever request the client intended
  });
}
