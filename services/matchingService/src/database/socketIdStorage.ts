import redisClient from "./redis"

export class SocketIdStorage {
    static async storeSocketId(userid: string, socketid: string): Promise<void> {
        await redisClient.hSet(`useridSocket:${userid}`, 'socketid', socketid)
    }

    static async removeSocketId(userid: string): Promise<void> {
        await redisClient.hDel(`useridSocket:${userid}`, 'socketid')
    }

    static async getSocketId(userid: string): Promise<string | null> {
        return await redisClient.hGet(`useridSocket:${userid}`, 'socketid')
    }
}