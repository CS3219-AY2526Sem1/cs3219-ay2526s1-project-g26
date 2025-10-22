import { Server, Socket } from 'socket.io'
import { UserStorage } from '../database/userStorage'
import { UserInfo } from '../models/userInfo'
import { SocketIdStorage } from '../database/socketIdStorage'

export async function cancelMatchHandler(
  userid: string
): Promise<void> {
  console.log('cancelMatch event received by matching service')
  try {
    if (!await UserStorage.userExist(userid)) {
      throw new Error('User is already not in queue')
    }
    await UserStorage.removeUser(userid)
    await SocketIdStorage.removeSocketId(userid)
  } catch (error) {
    console.error('Cancel match error: ', error)
  }
}
