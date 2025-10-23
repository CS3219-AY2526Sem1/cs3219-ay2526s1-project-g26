import { Server, Socket } from 'socket.io'
import { UserInfo } from '../models/userInfo'
import { UserStorage } from '../database/userStorage'
import { SocketIdStorage } from '../database/socketIdStorage'
import { randomUUID } from 'crypto'
import { QUESTION_SERVICE_URL } from '../config'
import { matchSuccess } from '../constants/eventNames'
import { getToken } from './matchingSocketHandler'

export async function joinMatchHandler(
  io: Server,
  socket: Socket,
  userinfo: UserInfo
): Promise<void> {
  if (await UserStorage.userExist(userinfo.id)) {
    throw new Error('User already in queue')
  }
  const matchedUser = await UserStorage.getMatch(userinfo)

  if (!matchedUser || !(await UserStorage.userExist(matchedUser.id))) {
    await UserStorage.storeUser(userinfo)
  } else {
    const overlapTopics = userinfo.topics.filter((topic) =>
      matchedUser.topics.includes(topic)
    )
    const overlapDifficulties = userinfo.difficulty.filter((diff) =>
      matchedUser.difficulty.includes(diff)
    )
    const token = getToken(socket)
    const question = await fetchQuestion(
      overlapDifficulties,
      overlapTopics,
      token
    )

    const otherSocketId = await SocketIdStorage.getSocketId(matchedUser.id)
    if (!otherSocketId) {
      await UserStorage.removeUser(matchedUser.id)
      await SocketIdStorage.removeSocketId(matchedUser.id)
      await UserStorage.storeUser(userinfo)
    } else {
      const roomid = randomUUID()
      io.to(otherSocketId).emit(matchSuccess, { roomid, question })
      io.to(socket.id).emit(matchSuccess, { roomid, question })

      await UserStorage.removeUser(matchedUser.id)
      await SocketIdStorage.removeSocketId(matchedUser.id)
      await UserStorage.removeUser(userinfo.id)
      await SocketIdStorage.removeSocketId(userinfo.id)
    }
  }
}

async function fetchQuestion(
  overlapDifficulties: string[],
  overlapTopics: string[],
  token: string
): Promise<any> {
  const params = new URLSearchParams({
    difficulty: overlapDifficulties.join(','),
    categories: overlapTopics.join(','),
  })
  const res = await fetch(`${QUESTION_SERVICE_URL}/match?${params}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch question with status: ${res.status}`)
  }
  const body = (await res.json()) as { success: boolean; question: any }
  return body.question
}
