import { type IncomingMessage } from 'node:http'
import * as Config from '../../config/index.js'

export default async function hasValidToken(
  req: IncomingMessage
): Promise<boolean> {
  try {
    const url = new URL(req.url || '', `http://${req.headers.host}`)
    const token = url.searchParams.get('token')
    if (!token) return false

    const res = await fetch(`${Config.USER_SERVICE_URL}/auth/verify-token`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
    })

    return res.ok
  } catch (_err) {
    return false
  }
}
