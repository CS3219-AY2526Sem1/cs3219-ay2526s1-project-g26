import { io } from 'socket.io-client'
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api.ts'
import { store } from '../store'

export const socket = io(`${API_BASE_URL}`, {
  autoConnect: false,
  path: `${API_ENDPOINTS.MATCHING}/socket.io`,
})

export function initSocket() {
  const { user: userStore } = store.getState()
  const userId = userStore.user?.id
  const token = localStorage.getItem('authToken')
  socket.auth = { token, userId }
  if (!socket.connected) socket.connect()
}

export function disconnectSocket() {
  if (socket.connected) socket.disconnect()
}
