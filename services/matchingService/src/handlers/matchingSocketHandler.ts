import { Server, Socket } from 'socket.io'
import { joinMatchHandler } from './joinMatchHandler.js'
import { cancelMatchHandler } from './cancelMatchHandler.js'
import { getUserInfo } from '../models/userInfo.js'

export function matchingSocketHandler(io: Server): void {
  io.on('connection', (socket: Socket) => {
    console.log('User connected with socket id: ', socket.id)
  
    // Join match handler
    socket.on('joinMatch', async (data) => {
      const userinfo = getUserInfo(data)
      await joinMatchHandler(io, socket, userinfo)
    })

    // Cancel match handler
    socket.on('cancelMatch', async (data) => {
      const userinfo = getUserInfo(data)
      await cancelMatchHandler(io, socket, userinfo)
    })

    // Disconnect handler
    socket.on('disconnect', async () => {
      // TODO: Disconnect logic
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
