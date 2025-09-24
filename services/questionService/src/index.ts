import dotenv from 'dotenv'

dotenv.config()

import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { getLogger } from './utils/logger.js'
import questionRoute from './routes/questionRoute.js'
import errorHandler from './middleware/errorHandler.js'
import { PORT } from './config/index.js'

const logger = getLogger('app')
const app = express()

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
