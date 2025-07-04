import { config } from '@yappr/backend-common/config'
import cluster from 'cluster'
import os from 'os'
import app from '@/app'
import logger from '@yappr/common/logger'

const numCPUs = os.cpus().length

try {
  config.validate(['port', 'jwtSecret'])
} catch (err) {
  logger.error('Configuration validation failed:', err)
  process.exit(1)
}

const PORT = config.getConfig('port')

if (cluster.isPrimary) {
  console.log(`Primary process ${process.pid} is running`)

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker process ${worker.process.pid} died. Restarting...`)
    cluster.fork()
  })
} else {
  const server = app.listen(PORT, (err?: Error) => {
    if (err) {
      console.error('Failed to start server:', err)
    } else {
      console.log(`Worker process ${process.pid} connected to PORT: ${PORT}`)
    }
  })

  const gracefulShutdown = () => {
    console.log(
      `Worker ${process.pid} received shutdown signal. Shutting down gracefully...`,
    )
    server.close(() => {
      console.log(`Worker ${process.pid} closed.`)
      process.exit(0)
    })

    setTimeout(() => {
      console.error(
        `Worker ${process.pid} forced to exit after shutdown timeout.`,
      )
      process.exit(1)
    }, 10000)
  }

  process.on('SIGINT', gracefulShutdown)
  process.on('SIGTERM', gracefulShutdown)
}
