import { Server, Socket } from 'socket.io'
<<<<<<< HEAD
import { UserStorage } from '../database/userStorage'
import { UserInfo } from '../models/userInfo'
import { SocketIdStorage } from '../database/socketIdStorage'
=======
import { UserManager } from '../database/userManager.js'
import { UserInfo } from '../models/userInfo.js'
>>>>>>> develop

export async function cancelMatchHandler(userid: string): Promise<void> {
  console.log('cancelMatch event received by matching service')
  try {
    if (!(await UserStorage.userExist(userid))) {
      throw new Error('User is already not in queue')
    }
    await UserStorage.removeUser(userid)
    await SocketIdStorage.removeSocketId(userid)
  } catch (error) {
    console.error('Cancel match error: ', error)
  }
}
