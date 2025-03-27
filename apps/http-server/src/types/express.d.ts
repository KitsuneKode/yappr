declare module 'express-serve-static-core' {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export {};
