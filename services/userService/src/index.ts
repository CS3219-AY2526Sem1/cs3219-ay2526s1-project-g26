import dotenv from 'dotenv'

dotenv.config()

import express, { Request, Response } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { getLogger } from './utils/logger.js'
import authRoute from './routes/authRoute.js'
import profileRoute from './routes/profileRoute.js'
import errorHandler from './middleware/errorHandler.js'
import { PORT } from './config/index.js'

const logger = getLogger('app')
const app = express()

app.use(cors())
app.use(
  morgan('tiny', {
    stream: { write: logger.http.bind(logger) },
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/auth', authRoute)
app.use('/profile', profileRoute)

app.use('/user/auth', authRoute)

app.get('/', (_req: Request, res: Response) => {
  res.send('Hello from Express + TypeScript!')
})

app.use(errorHandler)

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})
