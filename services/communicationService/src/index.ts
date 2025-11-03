import { getLogger } from './utils/logger.js'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

const logger = getLogger('communication-service')
const app = express()
app.use(cors())
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['content-type'],
  },
  allowEIO3: true,
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 60000,
})

// Store active rooms and their participants
const rooms = new Map<string, Set<string>>()

io.of('/microphone').on('connection', (socket) => {
  logger.info('User connected:', socket.id)

  // Handle joining a room
  socket.on('joinRoom', (roomId: string) => {
    // Join the socket.io room
    socket.join(`microphone/${roomId}`)

    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set())
    }

    // Add user to room
    rooms.get(roomId)?.add(socket.id)

    // Notify others in the room
    socket.to(`microphone/${roomId}`).emit('userJoined', socket.id)

    // Send list of existing users to the new participant
    const roomParticipants = Array.from(rooms.get(roomId) || [])
    socket.emit(
      'roomUsers',
      roomParticipants.filter((id) => id !== socket.id)
    )
  })

  // Handle voice data
  socket.on('voiceData', (data: { roomId: string; audio: ArrayBuffer }) => {
    socket.to(`microphone/${data.roomId}`).emit('voiceData', {
      userId: socket.id,
      audio: data.audio,
    })
  })

  // Handle disconnection
  socket.on('disconnect', () => {
    // Find and remove user from all rooms they were in
    rooms.forEach((participants, roomId) => {
      if (participants.has(socket.id)) {
        participants.delete(socket.id)
        // Notify others in the room
        socket.to(`microphone/${roomId}`).emit('userLeft', socket.id)

        // Clean up empty rooms
        if (participants.size === 0) {
          rooms.delete(roomId)
        }
      }
    })
  })
})

const PORT = process.env.PORT || 4070
httpServer.listen(PORT, () => {
  logger.info(`Communication service listening on port ${PORT}`)
})
