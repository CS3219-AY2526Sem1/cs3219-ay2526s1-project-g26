import { Server, Socket } from 'socket.io'
import { joinMatchHandler } from './joinMatchHandler'
import { cancelMatchHandler } from './cancelMatchHandler'
import { getUserInfo } from '../models/userInfo'

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
}
