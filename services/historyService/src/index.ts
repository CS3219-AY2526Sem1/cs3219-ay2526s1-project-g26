import dotenv from 'dotenv'

dotenv.config()

import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { getLogger } from './utils/logger.js'
import historyRoute from './routes/submissionHistoryRoute.js'
import errorHandler from './middleware/errorHandler.js'
import { PORT } from './config/index.js'
import { connectDB } from './database/index.js'
import { runConsumer } from './services/consumerService.js'

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

app.use('/submissions', historyRoute)

app.use(errorHandler)

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})

runConsumer().catch((err) => {
  logger.error('Kafka consumer failed to start', err)
  process.exit(1)
})
