import dotenv from 'dotenv'

dotenv.config()

import express from 'express';
import cors from 'cors'
import { PORT } from './config/index.js'
import { getLogger } from './utils/logger.js';
import matchingRoute from "./routes/matchingRoute.js"
import morgan from 'morgan';
import errorHandler from './middleware/errorHandler.js';

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

app.use('/', matchingRoute)

app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Running on Port ${PORT}`)
}); 