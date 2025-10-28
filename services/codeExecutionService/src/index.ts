import dotenv from 'dotenv'

dotenv.config()

import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { getLogger } from './utils/logger.js'
import codeExecutionRoute from './routes/codeExecutionRoute.js'
import errorHandler from './middleware/errorHandler.js'
import { PORT } from './config/index.js'

const logger = getLogger('Server')
const app = express()

// Middleware
app.use(
  morgan('tiny', {
    stream: { write: logger.http.bind(logger) },
  })
)
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/', codeExecutionRoute)

// Error handling middleware (must be last)
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  logger.info(`Code Execution Service running on port ${PORT}`)
})
