import { createLogger, format, transports, Logger } from 'winston'

const { combine, timestamp, errors, printf, colorize } = format

const customFormat = printf(({ level, message, label, timestamp, stack }) => {
  if (typeof message === 'object') {
    message = JSON.stringify(message)
  }
  return `${timestamp} [${label}] ${level}: ${stack || message}`
})

const TRANSPORTS = {
  CONSOLE: new transports.Console({
    level: 'debug',
    format: colorize({ all: true }),
  }),
}

const logger: Logger = createLogger({
  format: combine(timestamp(), errors({ stack: true }), customFormat),
  transports: [TRANSPORTS.CONSOLE],
  exceptionHandlers: [TRANSPORTS.CONSOLE],
})

export const getLogger = (label: string): Logger => logger.child({ label })
