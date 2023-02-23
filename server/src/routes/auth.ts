import express from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import crypto from 'crypto';

import DB from '../db';
import { UserDao } from '../db/models/User';

const verifyUser =
  (db: DB) => async (username: string, password: string, done: Function) => {
    const user: UserDao = await db.findUserByUsername(username);
    if (!user) {
      return done(null, false, { message: 'Incorrect username or password.' });
    }

    crypto.pbkdf2(
      password,
      user.salt,
      310000,
      32,
      'sha256',
      (err, hashedPassword) => {
        if (err) {
          return done(err);
        }
        if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
          return done(null, false, {
            message: 'Incorrect username or password.',
          });
        }
        passport.serializeUser(function (user: UserDao, cb) {
          console.log('\n\nserializing\n\n');
          cb(null, { id: user.id, username: user.username } as UserDao);
        });

        passport.deserializeUser(function (user: UserDao, cb) {
          console.log('\n\ndeserializing user', user, '\n\n');
          return cb(null, user);
        });
        return done(null, user);
      },
    );
  };

export default (db: DB) => {
  passport.use(new LocalStrategy(verifyUser(db)));

  const router = express.Router();

  router.post(
    '/login',
    passport.authenticate('local', {
      failureMessage: 'Bad Credentials',
    }),
    (req, res) => {
      res.status(200).send(req.user);
    },
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
