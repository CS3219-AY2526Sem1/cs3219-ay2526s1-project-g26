import { Server, Socket } from 'socket.io'
import { UserInfo } from '../models/userInfo.js'

const stubQuestion = {
  id: 1,
  title: 'stub Question',
  description: 'yes',
  difficulty: 'Hard',
}

const otherUser: UserInfo = {
  id: '123',
  topics: ['Graph', 'Trees'],
  difficulty: ['Medium', 'Hard'],
}

let isMatch = false // Toggles between true and false for every joinMatch event received

export async function joinMatchHandler(
  io: Server,
  socket: Socket,
  userinfo: UserInfo
): Promise<void> {
  console.log('joinMatch event received')
  const userId = userinfo.id
  console.log(isMatch)
  try {
    if (isMatch) {
      const response = {
        user1: userId,
        user2: otherUser.id,
        question: stubQuestion,
      }
      io.to(socket.id).emit('matchFound', response)
    } else {
      io.to(socket.id).emit('waitingForMatch')
    }
    isMatch = !isMatch
  } catch (error) {
    console.error('Join match error: ', error)
    io.to(socket.id).emit('error', { message: 'Failed to join match' })
  }
}
