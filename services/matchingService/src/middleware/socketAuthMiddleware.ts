import { USER_SERVICE_URL } from '../config'

export function socketAuthMiddleware() {
  return async (socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) {
      next(new Error('Missing Auth Token'))
    }
    const res = await fetch(`${USER_SERVICE_URL}/auth/verify-token`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      next()
    } else {
      next(new Error('Invalid Auth Token'))
    }
  }
}
