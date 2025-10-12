import { UserInfo } from '../models/userInfo'
import redisClient from './redis'

// Stores the information of all users who are currently waiting for a match
export class UserManager {
  // Store complete user profile
  static async storeUser(userId: string, userFields: UserInfo): Promise<void> {
    await redisClient.hSet(`user:${userId}`, {
      topics: JSON.stringify(userFields.topics),
      difficulty: JSON.stringify(userFields.difficulty),
    })
  }

  static async getSocketId(userId: string): Promise<string | null> {
    return await redisClient.hGet(`user:${userId}`, 'socketId')
  }

  // Delete user
  static async deleteUser(userId: string): Promise<void> {
    await redisClient.del(`user:${userId}`)
  }

  // Checks if userid exists
  static async userExist(userId: string): Promise<boolean> {
    return (await redisClient.exists(`user:${userId}`)) === 1
  }
}
