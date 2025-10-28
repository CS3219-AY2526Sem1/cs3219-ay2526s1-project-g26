import redisClient from './redis.js'

import { getLogger } from '../utils/logger.js'
const logger = getLogger('socketIdStorage')

export class SocketIdStorage {
  static async storeSocketId(userid: string, socketid: string): Promise<void> {
    logger.info(
      'SocketIdStorage: Storing socketid of ' +
        socketid +
        ' for userid: ' +
        userid
    )
    await redisClient.hSet(`useridSocket:${userid}`, 'socketid', socketid)
  }

  static async removeSocketId(userid: string): Promise<void> {
    logger.info('SocketIdStorage: Removing socketid of user: ' + userid)
    await redisClient.hDel(`useridSocket:${userid}`, 'socketid')
  }

  static async getSocketId(userid: string): Promise<string | null> {
    return await redisClient.hGet(`useridSocket:${userid}`, 'socketid')
  }
}
