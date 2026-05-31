import * as bcrypt from 'bcrypt';
import { Request, Response, Router } from 'express';
import * as jwt from 'jsonwebtoken';

import DB from '../db';
import { clearAuthCookie, setAuthCookie } from '../cookieOptions';
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

    await db.createUser(user);

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'foobar_jwt');

    setAuthCookie(res, token);

    return res.send({
      message: 'User created',
      user: { id: user.id, username: user.username, email: user.email },
    });
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
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'foobar_jwt');

    setAuthCookie(res, token);

    return res.send({
      message: 'Logged in successfully',
      user: { id: user.id, username: user.username, email: user.email },
    });
  });

  router.post('/logout', (req, res) => {
    clearAuthCookie(res);
    res.status(200).send('Logged out');
  });

  router.get('/info', tokenAuth, async (req: UserAuthRequest, res) => {
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
