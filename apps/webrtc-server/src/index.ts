import { Server } from 'socket.io'

import express from 'express'

const app = express()
const io = new Server({
  cors: {
    origin: '*',
  },
})

app.use(express.json())

const emailToSocketIdMapping = new Map()
const socketIdToEmailMapping = new Map()

io.on('connection', (socket) => {
  console.log('New Connection', socket.id)
  socket.on('join-room', (data) => {
    const { email, roomId } = data
    console.log('User joined', email)
    emailToSocketIdMapping.set(email, socket.id)
    socketIdToEmailMapping.set(socket.id, email)
    socket.broadcast
      .to(roomId)
      .emit('user-joined', { email, socketId: socket.id.toString() })
    socket.join(roomId)
    io.to(socket.id).emit('join-room', data)
  })
})

app.listen(8082, () => {
  console.log('Server is running on port 8082')
})
io.listen(8081)
