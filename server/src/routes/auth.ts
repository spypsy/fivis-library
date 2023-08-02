import * as bcrypt from 'bcrypt';
import { Request, Response, Router } from 'express';
import * as jwt from 'jsonwebtoken';

import DB from '../db';
import { UserDao } from '../db/models/User';

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
    res.cookie('token', token, {
      httpOnly: true,
      secure: true, // set to true if your application is using https
      sameSite: 'strict',
    });

    return res.send({ message: 'Logged in successfully', user: { ...user, password: null } });
  });

  return router;
};
