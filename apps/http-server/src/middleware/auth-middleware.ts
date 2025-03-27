import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { JWT_SECRET } from '@repo/backend-common/config';

export const auth = (req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl === '/api/auth') {
    console.log('Auth check');
  }

  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Authorization header missing' });
    return;
  }

  try {
    const decodedToken = jwt.verify(token, JWT_SECRET!) as JwtPayload;
    // @ts-ignore
    req.userId = decodedToken.id;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
    return;
  }
};
