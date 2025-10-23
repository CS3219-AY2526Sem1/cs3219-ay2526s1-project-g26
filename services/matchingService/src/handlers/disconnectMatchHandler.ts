import { Socket } from 'socket.io'
import { SocketIdStorage } from '../database/socketIdStorage.js'
import { UserStorage } from '../database/userStorage.js'
import { getUserId } from './matchingSocketHandler.js'

export async function disconnectMatchHandler(socket: Socket, reason: string) {
  console.log('User disconnected with reason: ' + reason)
  const userId = getUserId(socket)
  if (!userId) {
    console.log('Missing userId in the socket')
    return
  }
  await SocketIdStorage.removeSocketId(userId)
  await UserStorage.removeUser(userId)
}
