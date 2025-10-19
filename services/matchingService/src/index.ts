import dotenv from 'dotenv'

dotenv.config()

import express from 'express'
import cors from 'cors'
import { PORT } from './config/index.js'
import { getLogger } from './utils/logger.js'
import morgan from 'morgan'
import errorHandler from './middleware/errorHandler.js'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { matchingSocketHandler } from './handlers/matchingSocketHandler.js'
import { socketAuthMiddleware } from './middleware/socketAuthMiddleware.js'

const logger = getLogger('app')
const app = express()
const server = createServer(app)
const io = new Server(server, {
  connectionStateRecovery: {},
  cors: {
    origin: ['http://localhost:3000']
  }
})

io.use(socketAuthMiddleware())

app.use(
  morgan('tiny', {
    stream: { write: logger.http.bind(logger) },
  })
)
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

matchingSocketHandler(io)

app.use(errorHandler)

server.listen(PORT, () => {
  console.log(`Running on Port ${PORT}`)
})
