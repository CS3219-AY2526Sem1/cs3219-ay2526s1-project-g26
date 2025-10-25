import { UserStorage } from '../database/userStorage.js'
import { SocketIdStorage } from '../database/socketIdStorage.js'
import { getLogger } from '../utils/logger.js'

const logger = getLogger('cancelMatchHandler')

export async function cancelMatchHandler(userid: string): Promise<void> {
  logger.info('cancelMatch event received by matching service')
  try {
    if (!(await UserStorage.userExist(userid))) {
      throw new Error('User is already not in queue')
    }
    await UserStorage.removeUser(userid)
    await SocketIdStorage.removeSocketId(userid)
  } catch (error) {
    logger.error('Cancel match error: ', error)
  }
}
