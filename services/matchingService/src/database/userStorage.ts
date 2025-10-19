import { Difficulty, UserInfo } from '../models/userInfo'
import redisClient from './redis'

interface UserStorageFields {
  id: string
  topics: string[]
  difficulty: Difficulty[]
  timeJoined: number
}

export class UserStorage {
  static async storeUser(userInfo: UserInfo): Promise<void> {
    await redisClient.sAdd('userIds', userInfo.id)
    await redisClient.hSet(`user:${userInfo.id}`, {
      topics: JSON.stringify(userInfo.topics),
      difficulty: JSON.stringify(userInfo.difficulty),
      timeJoined: Date.now()
    })
  }

  static async deleteUser(userId: string): Promise<void> {
    await redisClient.sRem('userIds', userId)
    await redisClient.hDel(`user:${userId}`, 'topics')
    await redisClient.hDel(`user:${userId}`, 'difficulty')
    await redisClient.hDel(`user:${userId}`, 'timeJoined')
  }

  static async userExist(userId: string): Promise<boolean> {
    return (await redisClient.sIsMember('userIds', userId)) === 1
  }

  static async getMatch(userInfo: UserInfo): Promise<UserInfo | null> {
    const users = await UserStorage.getAllUsers()
    const currTime = Date.now()
 
    const sortedScores: [number, string][] = users.map((target, index): [number, string] => {
      const score = this.calculateSimilarityScore(userInfo, target, currTime)
      return [index, score]
    })
    // Sort in descending order (highest score first)
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    
    if (sortedScores.length === 0) return null

    const [bestIndex, bestScore] = sortedScores[0]

    // If best score starts with 0, it means no one else has overlapping topics
    if (bestScore.charAt(0) === '0') {
      // A to D is 5 digits, gets time waited by slicing from index 5 onwards
      const timeWaited = bestScore.slice(5)
      // If time waited > 2mins then match
      if (Number(timeWaited) >= 1000 * 60 * 2) { 
        return users[bestIndex]        
      } else {
        return null
      }
    }

    return users[bestIndex]
  }

  private static async getAllUsers(): Promise<UserStorageFields[]> {
    const userIds = await redisClient.sMembers('userIds')
    
    const results = await Promise.all(
      userIds.map(userId => redisClient.hGetAll(`user:${userId}`))
    )

    const users: UserStorageFields[] = results
      .map((data, i) => {
        return {
          id: userIds[i],
          topics: JSON.parse(data.topics),
          difficulty: JSON.parse(data.difficulties)
        } as UserStorageFields
      })

    return users;
  }

  // Returns similarity score between recently joined user and targetUser in the storage
  private static calculateSimilarityScore(user: UserInfo, targetUser: UserStorageFields, currTime: number): string {
    const user1Topics = user.topics
    const user1Difficulties = user.difficulty

    const user2Topics = targetUser.topics
    const user2Difficulties = targetUser.difficulty

    const overlapTopics = user1Topics.filter(topic => user2Topics.includes(topic))
    const overlapDifficulties = user1Difficulties.filter(diff => user2Difficulties.includes(diff))

    const A = overlapTopics.length === 0 ? '0' : '1' // 1 digit 
    const B = overlapDifficulties.length === 0 ? '0' : '1' // 1 digit
    const C = overlapTopics.length >= 10 ? String(overlapTopics.length) : '0' + String(overlapTopics.length) // 2 digit
    const D = overlapDifficulties.length // 1 digit
    const E = currTime - targetUser.timeJoined

    const similarityScore = `${A}${B}${C}${D}${E}`

    return similarityScore
  }

}
