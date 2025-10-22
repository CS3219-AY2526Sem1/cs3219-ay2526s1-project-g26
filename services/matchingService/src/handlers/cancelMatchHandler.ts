import { Server, Socket } from 'socket.io'
import { UserStorage } from '../database/userStorage'
import { UserInfo } from '../models/userInfo'
import { SocketIdStorage } from '../database/socketIdStorage'

export async function cancelMatchHandler(
  io: Server,
  socket: Socket,
  userinfo: UserInfo
): Promise<void> {
  console.log('cancelMatch event received by matching service')
  const userId = userinfo.id
  try {
    if (!await UserStorage.userExist(userinfo.id)) {
      throw new Error('User is already not in queue')
    }
    await UserStorage.removeUser(userinfo.id)
    await SocketIdStorage.removeSocketId(userinfo.id)
  } catch (error) {
    console.error('Cancel match error: ', error)
  }
}
