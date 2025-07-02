import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import { JWT_SECRET } from '@yappr/backend-common/config';

export const auth = (req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl === '/api/auth') {
    console.log('Auth check');
  }

  // const token = req.headers['authorization']?.split(' ')[1];
  const token = req.cookies.token;

  console.log(token, 'token');

  if (!token) {
    res.status(401).json({ error: 'Token missing' });
    return;
  }

  try {
    const decodedToken = jwt.verify(token, JWT_SECRET!) as JwtPayload;
    console.log(decodedToken, 'decodedToken');
    req.userId = decodedToken.userId;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
    return;
  }
};
