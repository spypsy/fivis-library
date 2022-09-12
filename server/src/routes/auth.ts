import express from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import crypto from 'crypto';

import DB from '../db';
import { UserDao } from '../db/models/User';

const verifyUser = (db: DB) => async (username: string, password: string, cb: Function) => {
  const user: UserDao = await db.findUserByUsername(username);

  crypto.pbkdf2(password, user.salt, 310000, 32, 'sha256', (err, hashedPassword) => {
    if (err) {
      return cb(err);
    }
    if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
      return cb(null, false, { message: 'Incorrect username or password.' });
    }
    passport.serializeUser(function (user: UserDao, cb) {
      cb(null, { id: user.id, username: user.username });
    });

    passport.deserializeUser(function (user, cb) {
      return cb(null, user);
    });
    return cb(null, user);
  });
};

export default (db: DB) => {
  passport.use(new LocalStrategy(verifyUser(db)));

  const router = express.Router();

  router.post(
    '/login',
    passport.authenticate('local', {
      successRedirect: '/api/hello',
      failureRedirect: '/login',
    }),
  );

  router.post('/logout', function (req, res, next) {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect('/');
    });
  });

  return router;
};
