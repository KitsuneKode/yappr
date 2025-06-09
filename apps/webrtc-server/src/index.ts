import { Server } from 'socket.io'
import express from 'express'
import { createServer } from 'http'

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
  },
})

app.use(express.json())

const emailToSocketIdMapping = new Map()
const socketIdToEmailMapping = new Map()

const peer = io.of('/peer')
const chat = io.of('/chat')
const multiPeer = io.of('/group-video')

io.on('connection', (socket) => {
  console.log('New Connection', socket.id)

  socket.on('join-room', (data) => {
    const { email, roomId } = data
    console.log('User joined room:', roomId, 'email:', email)

    emailToSocketIdMapping.set(email, socket.id)
    socketIdToEmailMapping.set(socket.id, email)

    socket.join(roomId)

    socket.to(roomId).emit('user-joined', { email, socketId: socket.id })

    socket.emit('join-room', data)
  })

  socket.on('call-user', (data) => {
    const { email, offer } = data
    const socketId = emailToSocketIdMapping.get(email)
    const fromEmail = socketIdToEmailMapping.get(socket.id)

    if (!socketId) {
      console.error('Failed to call user:', email, 'Socket ID not found')
      socket.emit('call-error', { message: 'User not found' })
      return
    }

    console.log('Call from', fromEmail, 'to', email)

    try {
      io.to(socketId).emit('incoming-call', { fromEmail, offer })
    } catch (error) {
      console.error('Failed to send call to user:', error)
      socket.emit('call-error', { message: 'Failed to initiate call' })
    }
  })

  socket.on('call-accepted', (data) => {
    const { email, answer } = data
    const socketId = emailToSocketIdMapping.get(email)
    const calleeEmail = socketIdToEmailMapping.get(socket.id)

    if (!socketId) {
      console.error('Failed to accept call:', email, 'Socket ID not found')
      socket.emit('call-error', { message: 'Original caller not found' })
      return
    }

    console.log('Call accepted by', calleeEmail, 'sending answer to', email)

    try {
      io.to(socketId).emit('call-accepted', {
        email: calleeEmail,
        answer,
      })
    } catch (error) {
      console.error('Failed to send call acceptance:', error)
    }
  })

  // ✅ ENABLE negotiation handlers - they're needed!
  // socket.on('negotiation-needed', (data) => {
  //   const { email, offer } = data
  //   const socketId = emailToSocketIdMapping.get(email)
  //   const fromEmail = socketIdToEmailMapping.get(socket.id)
  //
  //   if (!socketId) {
  //     console.error(
  //       'Failed to negotiate with user:',
  //       email,
  //       'Socket ID not found',
  //     )
  //     return
  //   }
  //
  //   console.log('Negotiation needed from', fromEmail, 'to', email)
  //
  //   try {
  //     // ✅ FIXED: Emit correct event name
  //     io.to(socketId).emit('negotiation-needed', { fromEmail, offer })
  //   } catch (error) {
  //     console.error('Failed to send negotiation:', error)
  //   }
  // })
  //
  // socket.on('negotiation-needed:answer', (data) => {
  //   const { email, answer } = data
  //   const socketId = emailToSocketIdMapping.get(email)
  //   const fromEmail = socketIdToEmailMapping.get(socket.id)
  //
  //   if (!socketId) {
  //     console.error(
  //       'Failed to send negotiation answer:',
  //       email,
  //       'Socket ID not found',
  //     )
  //     return
  //   }
  //
  //   console.log('Negotiation answer from', fromEmail, 'to', email)
  //
  //   try {
  //     io.to(socketId).emit('negotiation-needed:answer', {
  //       email: fromEmail,
  //       answer,
  //     })
  //   } catch (error) {
  //     console.error('Failed to send negotiation answer:', error)
  //   }
  // })

  socket.on('ice-candidate', (data) => {
    const { iceCandidate, email } = data
    const socketId = emailToSocketIdMapping.get(email)
    const fromEmail = socketIdToEmailMapping.get(socket.id)

    if (!socketId) {
      console.error(
        'Failed to send ice candidate:',
        email,
        'Socket ID not found',
      )
      return
    }

    console.log('Sending ICE candidate from', fromEmail, 'to', email)

    try {
      io.to(socketId).emit('ice-candidate', {
        iceCandidate,
        email: fromEmail,
      })
    } catch (error) {
      console.error('Failed to send ice candidate:', error)
    }
  })

  socket.on('disconnect', (reason) => {
    const email = socketIdToEmailMapping.get(socket.id)
    console.log('User disconnected:', email, 'reason:', reason)

    if (email) {
      emailToSocketIdMapping.delete(email)
    }
    socketIdToEmailMapping.delete(socket.id)
  })
})

server.listen(8082, () => {
  console.log('HTTP Server is running on port 8082')
})
