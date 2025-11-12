import { Pool } from 'pg'
import * as Config from '../config/index.js'

const pool = new Pool({
  host: Config.DB_HOST,
  user: Config.DB_USER,
  password: Config.DB_PASSWORD,
  database: Config.DB_NAME,
  port: Config.DB_PORT,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

export default pool
