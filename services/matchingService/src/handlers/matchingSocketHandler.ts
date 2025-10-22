import { Server, Socket } from 'socket.io'
import { SocketIdStorage } from '../database/socketIdStorage'
import { getUserInfo } from '../models/userInfo'
import { cancelMatchHandler } from './cancelMatchHandler'
import { disconnectMatchHandler } from './disconnectMatchHandler'
import { joinMatchHandler } from './joinMatchHandler'

export function matchingSocketHandler(io: Server): void {
  io.on('connection', (socket: Socket) => {
    console.log('User connected with\nUser ID: ' + socket.handshake.auth.userId + '\nSocket ID: ' + socket.id)

    // Join match handler
    socket.on('joinMatch', async (data) => {
      try {
        const userinfo = getUserInfo(data)
        await SocketIdStorage.storeSocketId(userinfo.id, socket.id)
        await joinMatchHandler(io, socket, userinfo)
      } catch (err) {
        console.error('Failed to join match with err: ' + err)
        socket.emit('error' , err instanceof Error ? err.message : 'Unknown Error')
        await disconnectMatchHandler(socket, err as string)
      }
    })

    // Cancel match handler
    socket.on('cancelMatch', async (data) => {
      const userinfo = getUserInfo(data)
      await cancelMatchHandler(io, socket, userinfo)
    })

    // Disconnect handler
    socket.on('disconnect', async (reason) => {
      await disconnectMatchHandler(socket, reason)
    })
  })

  // Copied from https://socket.io/docs/v4/troubleshooting-connection-issues/#problem-the-socket-is-not-able-to-connect
  // For troubleshooting 
  io.engine.on("connection_error", (err) => {
    console.log(err.req);      // the request object
    console.log(err.code);     // the error code, for example 1
    console.log(err.message);  // the error message, for example "Session ID unknown"
    console.log(err.context);  // some additional error context
  });
}
