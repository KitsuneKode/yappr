import { JWT_SECRET, PORT } from '@repo/backend-common/config';
import cluster from 'cluster';
import os from 'os';
import app from './app';

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary process ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker process ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  const server = app.listen(PORT, (err?: Error) => {
    if (err) {
      console.error('Failed to start server:', err);
    } else {
      console.log(`Worker process ${process.pid} connected to PORT: ${PORT}`);
    }
  });

  process.on('SIGTERM', () => {
    console.log('Received SIGTERM signal. Shutting down gracefully...');
    server.close(() => {
      console.log('Server closed.');
      process.exit(0);
    });
  });
}
