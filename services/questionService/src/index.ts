import dotenv from 'dotenv'

dotenv.config()

import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { getLogger } from './utils/logger.js'
import questionRoute from './routes/questionRoute.js'
import errorHandler from './middleware/errorHandler.js'
import { PORT } from './config/index.js'
import { connectDB } from './database/index.js'
import { fork } from 'child_process'
import path from 'node:path'
import { fileURLToPath } from 'url'

const logger = getLogger('app')
const app = express()
connectDB()

app.use(
  morgan('tiny', {
    stream: { write: logger.http.bind(logger) },
  })
)
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/', questionRoute)

app.use(errorHandler)

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})

fork(
  path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    './utils/loadQuestionFromDBToRedis.js'
  )
)
