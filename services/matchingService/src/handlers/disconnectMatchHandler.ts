import { Socket } from 'socket.io'
import { SocketIdStorage } from '../database/socketIdStorage.js'
import { UserStorage } from '../database/userStorage.js'
import { getUserId } from './matchingSocketHandler.js'
import { getLogger } from '../utils/logger.js'
const logger = getLogger('disconnectMatchHandler')

export async function disconnectMatchHandler(socket: Socket, reason: string) {
  logger.info('User disconnected with reason: ' + reason)
  const userId = getUserId(socket)
  if (!userId) {
    logger.warning('Missing userId in the socket')
    return
  }
  await SocketIdStorage.removeSocketId(userId)
  await UserStorage.removeUser(userId)
}
