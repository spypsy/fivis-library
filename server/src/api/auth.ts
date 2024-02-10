import * as bcrypt from 'bcrypt';
import { Request, Response, Router } from 'express';
import * as jwt from 'jsonwebtoken';

import DB from '../db';
import { UserDao } from '../db/models/User';
import { UserAuthRequest, tokenAuth } from '../middleware/jwt';

export default (db: DB) => {
  const router = Router();
  router.post('/register', async (req: Request, res: Response) => {
    const { username, password } = req.body;

    // check if username is taken
    const existingUser = await db.findUserByUsername(username);
    if (existingUser) {
      return res.status(400).send({ message: `Username ${username} is taken.` });
    }

    const user = new UserDao();
    user.username = username;
    user.password = await bcrypt.hash(password, 10);
    console.log('user', user);

    await db.createUser(user);

    return res.send({ message: 'User created', user: { ...user, password: null } });
  });

  router.post('/login', async (req: Request, res: Response) => {
    // const userRepository = dataSource.getRepository(UserDao);
    const { username, password } = req.body;

    const user = await db.findUserByUsername(username);
    // const user = await userRepository.findOne({ where: { username } });

    if (!user) {
      return res.status(400).send({ message: 'Invalid username or password' });
    }

    const isValid = await user.validatePassword(password);

    if (!isValid) {
      return res.status(400).send({ message: 'Invalid username or password' });
    }

    // Create a signed JWT
    const token = jwt.sign(
      { userId: user.id }, // payload
      process.env.JWT_SECRET as string, // secret key
    );

    // Set JWT as a cookie on the client
    console.log('node env', process.env.NODE_ENV);
    res.cookie('token', token, {
      domain: process.env.NODE_ENV === 'dev' ? 'localhost' : '.fivislibrary.com',
      httpOnly: true,
      // secure: true, // set to true if your application is using https
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 30, // cookie expiration, in milliseconds
    });

    console.log('user', user);
    return res.send({ message: 'Logged in successfully', user: { ...user, password: undefined } });
  });

  router.post('/logout', (req, res) => {
    // Invalidate session or do other server-side logout logic here

    // Overwrite the auth cookie to expire immediately
    res.cookie('token', '', { expires: new Date(0), httpOnly: true, secure: true });

    res.status(200).send('Logged out');
  });

  router.get('/info', tokenAuth, async (req: UserAuthRequest, res) => {
    console.log('getting info');
    console.log('req.user', req.user);
    return res.json({
      user: {
        username: req.user.username,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
      },
    });
  });

  return router;
};
