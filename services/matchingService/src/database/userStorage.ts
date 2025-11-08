import { Difficulty, UserInfo } from '../models/userInfo.js'
import { sleep } from '../utils/index.js'
import { getLogger } from '../utils/logger.js'
import redisClient from './redis.js'
import {
  REDIS_UQ_EXPIRATION_TIME_SECONDS,
  REDIS_UQ_LOCK_KEY,
} from '../constants/index.js'
import { randomUUID, type UUID } from 'crypto'

const logger = getLogger('userStorage')

interface UserStorageFields {
  id: string
  topics: string[]
  difficulty: Difficulty[]
  timeJoined: number
}

export class UserStorage {
  private static id: UUID = randomUUID()

  static async storeUser(userInfo: UserInfo): Promise<void> {
    logger.info('UserStorage: Storing user: ' + userInfo.id)
    await redisClient.sAdd('userIds', userInfo.id)
    await redisClient.hSet(`user:${userInfo.id}`, {
      topics: JSON.stringify(userInfo.topics),
      difficulty: JSON.stringify(userInfo.difficulty),
      timeJoined: String(Date.now()),
    })
  }

  static async removeUser(userid: string): Promise<void> {
    logger.info('UserStorage: Removing user: ' + userid)
    await redisClient.sRem('userIds', userid)
    await redisClient.hDel(`user:${userid}`, 'topics')
    await redisClient.hDel(`user:${userid}`, 'difficulty')
    await redisClient.hDel(`user:${userid}`, 'timeJoined')
  }

  static async userExist(userid: string): Promise<boolean> {
    return (await redisClient.sIsMember('userIds', userid)) === 1
  }

  static async acquireUqLock(): Promise<void> {
    while (
      !(await redisClient.set(REDIS_UQ_LOCK_KEY, UserStorage.id.toString(), {
        NX: true,
        EX: REDIS_UQ_EXPIRATION_TIME_SECONDS,
      }))
    ) {
      await sleep()
    }
  }

  static async releaseUqLock(): Promise<void> {
    await redisClient.eval(
      `if redis.call("get", KEYS[1]) == ARGV[1]
        then
        return redis.call("del", KEYS[1])
       else
        return 0
        end`,
      {
        keys: [REDIS_UQ_LOCK_KEY],
        arguments: [UserStorage.id.toString()],
      }
    )
  }

  static async getMatch(userInfo: UserInfo): Promise<UserInfo | null> {
    logger.info('UserStorage: Getting a match for user: ' + userInfo.id)
    const users = await UserStorage.getAllUsers()
    const currTime = Date.now()

    let score: number = -1
    let target = null
    users.forEach((targetUserInfo) => {
      const targetUserScore = this.calculateScore(
        userInfo,
        targetUserInfo,
        currTime
      )
      if (targetUserScore > score) {
        score = targetUserScore
        target = targetUserInfo
      }
    })

    if (!((score >>> 21) & 1)) {
      return null
    }

    // If waiting time more than 2min, skip difficulty check and match
    if ((score >>> 20) & 1) {
      return target
    }

    // If third bit of score is 0 after checking first digit above
    // then no one else has overlapping difficulties
    if (!((score >>> 19) & 1)) {
      return null
    }

    return target
  }

  private static async getAllUsers(): Promise<UserStorageFields[]> {
    const userIds = await redisClient.sMembers('userIds')

    const results = await Promise.all(
      userIds.map((userId) => redisClient.hGetAll(`user:${userId}`))
    )

    const users: UserStorageFields[] = results.map((data, i) => {
      return {
        id: userIds[i],
        topics: JSON.parse(data.topics),
        difficulty: JSON.parse(data.difficulty),
        timeJoined: Number(data.timeJoined),
      } as UserStorageFields
    })

    return users
  }

  // Returns similarity score between recently joined user and targetUser in the storage
  private static calculateScore(
    user: UserInfo,
    targetUser: UserStorageFields,
    currTime: number
  ): number {
    const user1Topics = user.topics
    const user1Difficulties = user.difficulty

    const user2Topics = targetUser.topics
    const user2Difficulties = targetUser.difficulty

    const overlapTopics = user1Topics.filter((topic) =>
      user2Topics.includes(topic)
    )
    const overlapDifficulties = user1Difficulties.filter((diff) =>
      user2Difficulties.includes(diff)
    )
    const waitingTime = Math.round((currTime - targetUser.timeJoined) / 1000) // Time waited in seconds

    const A = Number(overlapTopics.length >= 1) // 1 bit
    const T = waitingTime >= 5 ? 1 : 0 // 1 bit
    const B = Number(overlapDifficulties.length >= 1) // 1 bit
    const C = overlapTopics.length // 5 bits
    const D = overlapDifficulties.length // 2 bits
    const E = Math.min(waitingTime, 3600) // 12 bits - time waited in seconds up to max of 1 hour

    return (A << 21) + (T << 20) + (B << 19) + (C << 14) + (D << 12) + E
  }
}
