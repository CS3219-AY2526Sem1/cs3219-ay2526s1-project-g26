import dotenv from 'dotenv'

dotenv.config()

import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { getLogger } from './utils/logger.js'
import codeExecutionRoute from './routes/codeExecutionRoute.js'
import errorHandler from './middleware/errorHandler.js'
import { PORT } from './config/index.js'
import { connectDB } from './database/index.js'

const logger = getLogger('Server')
const app = express()

// Connect to database
connectDB()

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

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Code Execution Service',
    version: '1.0.0',
    endpoints: {
      'POST /execute': 'Execute user code against test cases',
      'GET /health': 'Health check endpoint',
    },
  })
})

// Error handling middleware (must be last)
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  logger.info(`Code Execution Service running on port ${PORT}`)
  logger.info(`Available endpoints:`)
  logger.info(`  POST http://localhost:${PORT}/execute`)
  logger.info(`  GET  http://localhost:${PORT}/health`)
})
