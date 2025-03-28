import { JWT_SECRET } from '@repo/backend-common/config';
import { prisma } from '@repo/db';
import bcrypt from 'bcrypt';
import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import jwt from 'jsonwebtoken';
import { getValidationErrors, validate } from '@repo/common';
import { signInObject } from '@repo/common/types';

const router = Router();

router.post(
  '/signin',
  async (req: Request, res: Response, next: NextFunction) => {
    console.log('signin accessed');
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).send('Email and password are required');
      return;
    }

    const result = validate(signInObject, req.body);

    if (!result.success) {
      res.status(411).json({
        message: 'Errors in Input',
        errors: getValidationErrors(result),
      });
      return;
    }

    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          password: true,
          id: true,
        },
      });

      if (!user) {
        res.status(401).json({ message: 'Invalid Credentials' });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        res.status(401).json({ message: 'Invalid Credentials' });
        return;
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET!);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        sameSite: 'strict',
      });

      res.status(200).json({ message: 'Signed in successfully', token });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/signup',
  async (req: Request, res: Response, next: NextFunction) => {
    console.log('signup accessed');
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      res
        .status(400)
        .json({ message: 'Email, password and username are required' });
      return;
    }

    try {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        res.status(400).json({ message: 'User already exists' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: { email, password: hashedPassword, username },
      });

      if (!user) {
        res.status(400).json({ message: 'Failed to create user' });
        return;
      }

      res.status(200).json({ message: 'Signed up successfully' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
