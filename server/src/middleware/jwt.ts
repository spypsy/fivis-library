import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

import { UserDao } from '../db/models/User';

export interface UserAuthRequest extends Request {
  user: UserDao; // or any other type
}

export function tokenAuth(req: UserAuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies.token;

  if (token == null) {
    return res.sendStatus(401); // if there isn't any token
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next(); // pass the execution off to whatever request the client intended
  });
}
