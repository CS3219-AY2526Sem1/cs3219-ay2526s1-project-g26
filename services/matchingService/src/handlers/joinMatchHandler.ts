import { Server, Socket } from 'socket.io'
import { UserInfo } from '../models/userInfo'
import { UserStorage } from '../database/userStorage'

const stubQuestion = {
  id: 1,
  title: 'stub Question',
  description: 'yes',
  difficulty: 'hard',
}

const otherUser: UserInfo = {
  id: '123',
  topics: ['Graph', 'Trees'],
  difficulty: ['medium', 'hard'],
}

export async function joinMatchHandler(
  io: Server,
  socket: Socket,
  userinfo: UserInfo
): Promise<void> {
  console.log('joinMatch event received')
  const userId = userinfo.id
  const selectedTopics = userinfo.topics
  const selectedDifficulties = userinfo.difficulty

  const matchedUser = await UserStorage.getMatch(userinfo)
  if (!matchedUser) {
    await UserStorage.storeUser(userinfo)
  }
  
  const question = await 
}
