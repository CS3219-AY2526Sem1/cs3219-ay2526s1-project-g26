#!/usr/bin/env node
import dotenv from 'dotenv'

dotenv.config()
import express from 'express'
import http from 'http'
import WebSocket from 'ws'
import { setupWSConnection } from './utils/y-websocket/index.js'
import { PORT } from './config'
import { parseInt } from 'lib0/number'
import hasValidToken from './utils/y-websocket/hasValidToken'
import errorHandler from './middleware/errorHandler'

const app = express()
app.use(express.json())
app.use(errorHandler)
const wss = new WebSocket.Server({ noServer: true })

wss.on('connection', setupWSConnection)

const server = http.createServer(app)

server.on('upgrade', (request, socket, head) => {
  hasValidToken(request).then((valid) => {
    if (!valid) {
      socket.destroy()
      return
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request)
    })
  })
})

const HOST = process.env.HOST || '0.0.0.0'
server.listen(parseInt(PORT), HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`)
})
