import { Pool } from 'pg'
import * as Config from '../config/index.js'

const pool = new Pool({
  connectionString: Config.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

export default pool
