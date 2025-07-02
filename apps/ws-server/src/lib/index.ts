import { JWT_SECRET } from '@yappr/backend-common/config';
import jwt, { type JwtPayload } from 'jsonwebtoken';

export const checkAuthentication = (token: string): string | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as JwtPayload;
    if (!decoded.userId) {
      throw new Error('No userId');
    }
    return decoded.userId;
  } catch (err) {
    return null;
  }
};
