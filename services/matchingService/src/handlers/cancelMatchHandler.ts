import { UserStorage } from '../database/userStorage.js'
import { SocketIdStorage } from '../database/socketIdStorage.js'

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
