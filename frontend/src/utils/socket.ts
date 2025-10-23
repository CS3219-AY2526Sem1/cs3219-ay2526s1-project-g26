import { io } from 'socket.io-client'

export const socket = io('http://localhost:4020', {
  autoConnect: false,
})

export function initSocket({
  token,
  userId,
}: {
  token: string | null
  userId?: string | null
}) {
  socket.auth = { token, userId }
  if (!socket.connected) socket.connect()
}

export function disconnectSocket() {
  if (socket.connected) socket.disconnect()
}
