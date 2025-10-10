import { Server, Socket } from 'socket.io'
import { joinMatchHandler } from './joinMatchHandler'
import { cancelMatchHandler } from './cancelMatchHandler'

export function matchingSocketHandler(io: Server): void {
  io.on('connection', (socket: Socket) => {
    console.log('User connected with socket id: ', socket.id)

    // Join match handler
    socket.on('joinMatch', async (data) => {
      await joinMatchHandler(io, socket, data)
    })

    // Cancel match handler
    socket.on('cancelMatch', async (data) => {
      await cancelMatchHandler(io, socket, data)
    })

    // Disconnect handler
    socket.on('disconnect', async () => {
      // TODO: Disconnect logic
    })
  })
}
