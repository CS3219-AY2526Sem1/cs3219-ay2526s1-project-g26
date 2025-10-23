import redisClient from './redis'

export class SocketIdStorage {
  static async storeSocketId(userid: string, socketid: string): Promise<void> {
    console.log(
      'SocketIdStorage: Storing socketid of ' +
        socketid +
        ' for userid: ' +
        userid
    )
    await redisClient.hSet(`useridSocket:${userid}`, 'socketid', socketid)
  }

  static async removeSocketId(userid: string): Promise<void> {
    console.log('SocketIdStorage: Removing socketid of user: ' + userid)
    await redisClient.hDel(`useridSocket:${userid}`, 'socketid')
  }

  static async getSocketId(userid: string): Promise<string | null> {
    return await redisClient.hGet(`useridSocket:${userid}`, 'socketid')
  }
}
