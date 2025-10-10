import { Server, Socket } from 'socket.io'

const stubQuestion = {
  id: 1,
  title: 'stub Question',
  description: 'yes',
  difficulty: 'hard',
}

const otherUser = {
  id: 123,
}

let isMatch = false // Toggles between true and false for every joinMatch event received

export async function joinMatchHandler(
  io: Server,
  socket: Socket,
  data: any
): Promise<void> {
  console.log('joinMatch event received')
  const userId = data.id
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
