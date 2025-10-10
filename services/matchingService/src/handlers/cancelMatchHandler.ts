import { Server, Socket } from 'socket.io'
import { UserManager } from '../database/userManager'

export async function cancelMatchHandler(
  io: Server,
  socket: Socket,
  data: any
): Promise<void> {
  console.log('cancelMatch event received')
  const userId = data.id
  try {
    await UserManager.deleteUser(userId)
    io.to(socket.id).emit('matchCancelled')
  } catch (error) {
    if (!(await UserManager.userExist(userId))) {
      io.to(socket.id).emit('matchCancelled')
    } else {
      console.error('Cancel match error: ', error)
      io.to(socket.id).emit('error', { message: 'Failed to cancel match' })
    }
  }
}
