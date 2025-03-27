import dotenv from 'dotenv';
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET;
export const PORT = process.env.PORT;
export const FRONTEND_URL = process.env.FRONTEND_URL;
