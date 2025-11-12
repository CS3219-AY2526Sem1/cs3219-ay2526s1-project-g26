import { Server, Socket } from 'socket.io'
import { SocketIdStorage } from '../database/socketIdStorage.js'
import { getUserInfo } from '../models/userInfo.js'
import { cancelMatchHandler } from './cancelMatchHandler.js'
import { disconnectMatchHandler } from './disconnectMatchHandler.js'
import { joinMatchHandler } from './joinMatchHandler.js'
import { cancelMatch, disconnect, joinMatch } from '../constants/eventNames.js'
import { getLogger } from '../utils/logger.js'

const logger = getLogger('matchingSocketHandler')
export function matchingSocketHandler(io: Server): void {
  io.on('connection', (socket: Socket) => {
    logger.info(
      'User connected with: User ID: ' +
        getUserId(socket) +
        '; Socket ID: ' +
        socket.id
    )

    // Join match handler
    socket.on(joinMatch, async (data) => {
      try {
        const userinfo = getUserInfo(data)
        await SocketIdStorage.storeSocketId(userinfo.id, socket.id)
        await joinMatchHandler(io, socket, userinfo)
      } catch (err) {
        logger.error('Failed to join match with err: ' + err)
        socket.emit(
          'error',
          err instanceof Error ? err.message : 'Unknown Error'
        )
        await disconnectMatchHandler(socket, err as string)
      }
    })

    // Cancel match handler
    socket.on(cancelMatch, async (data) => {
      const userid = data.id
      await cancelMatchHandler(userid)
    })

    // Disconnect handler
    socket.on(disconnect, async (reason) => {
      await disconnectMatchHandler(socket, reason)
    })
  })

  // Copied from https://socket.io/docs/v4/troubleshooting-connection-issues/#problem-the-socket-is-not-able-to-connect
  // For troubleshooting
  io.engine.on('connection_error', (err) => {
    logger.error(err.req) // the request object
    logger.error(err.code) // the error code, for example 1
    logger.error(err.message) // the error message, for example "Session ID unknown"
    logger.error(err.context) // some additional error context
  })
}

export function getToken(socket: Socket): string {
  return socket.handshake.auth.token
}

export function getUserId(socket: Socket): string {
  return socket.handshake.auth.userId
}
