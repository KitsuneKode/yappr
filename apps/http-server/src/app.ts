import userRoutes from './routes/user-routes';
import express, {
  type Application,
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import cors from 'cors';
import { auth } from './middleware/auth-middleware';

const app: Application = express();

app.use(express.json());
app.use(cors());

const routes = [userRoutes];

routes.forEach((route) => {
  app.use('/api/v1/', route);
});

app.get('/api/health', (req, res) => {
  console.log('Health check');
  res.status(200).json({ status: 'OK' });
});

app.get('/api/auth', auth, (req, res) => {
  res.status(200).json({ status: 'authenticated' });
});

app.use('*', (req, res) => {
  console.log('Tried to access Not existing page:', req.originalUrl);
  res.status(404).json({ message: 'Page Not Found' });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log('Error in route:', req.originalUrl);
  console.error(err.message);
  res.status(500).json({ message: 'Internal Server Error' });
});

export default app;
