import { createClient } from 'redis'
import { REDIS_URL } from '../config/index.js'
import { getLogger } from '../utils/logger.js'

const logger = getLogger('redis')

const redisClient = createClient({ url: REDIS_URL })
redisClient.on('error', (err) => logger.error('Redis Client Error', err))
await redisClient.connect()

export default redisClient
