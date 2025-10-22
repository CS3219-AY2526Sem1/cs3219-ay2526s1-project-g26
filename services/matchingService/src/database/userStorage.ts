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
    console.log('UserStorage: Storing user: ' + userInfo.id)
    await redisClient.sAdd('userIds', userInfo.id)
    await redisClient.hSet(`user:${userInfo.id}`, {
      'topics': JSON.stringify(userInfo.topics),
      'difficulty': JSON.stringify(userInfo.difficulty),
      'timeJoined': String(Date.now())
    })
  }

  static async removeUser(userid: string): Promise<void> {
    console.log('UserStorage: Removing user: ' + userid)
    await redisClient.sRem('userIds', userid)
    await redisClient.hDel(`user:${userid}`, 'topics')
    await redisClient.hDel(`user:${userid}`, 'difficulty')
    await redisClient.hDel(`user:${userid}`, 'timeJoined')
  }

  static async userExist(userid: string): Promise<boolean> {
    return (await redisClient.sIsMember('userIds', userid)) === 1
  }

  static async getMatch(userInfo: UserInfo): Promise<UserInfo | null> {
    console.log('UserStorage: Getting a match for user: ' + userInfo.id)
    const users = await UserStorage.getAllUsers()
    const currTime = Date.now()
 
    const sortedScores: [number, string][] = users.map((target, index): [number, string] => {
      const score = this.calculateSimilarityScore(userInfo, target, currTime)
      return [index, score]
    })
    // Sort in descending order (highest score first)
    .sort((a, b) => Number(b[1]) - Number(a[1]))

    for (let i = 0; i < sortedScores.length; i++) {
      const score = sortedScores[i][1]
      const target = users[sortedScores[i][0]]

      // If score starts with 0, it means no one else has overlapping topics
      if (score.charAt(0) === '0') {
        const timeWaited = score.slice(5)
        if (Number(timeWaited) >= 1000 * 60 * 2 && await UserStorage.userExist(target.id)) { 
          return target
        } else {
          return null
        }
      }
      
      if (await UserStorage.userExist(target.id)) {
        return target
      }
    }
    return null
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
          difficulty: JSON.parse(data.difficulty),
          timeJoined: Number(data.timeJoined)
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
    const E = currTime - targetUser.timeJoined // time waited in milliseconds

    const similarityScore = `${A}${B}${C}${D}${E}`

    return similarityScore
  }

}
