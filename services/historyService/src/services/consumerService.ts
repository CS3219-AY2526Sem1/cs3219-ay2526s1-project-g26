import { consumer } from '../kafka/index.js'
import { getLogger } from '../utils/logger.js'
import { KAFKA } from '../constants/index.js'
import { CreateSubmissionBody } from '../models/submissionHistoryModel.js'
import { insertSubmission } from './submissionHistoryService.js'

const logger = getLogger('kafkaConsumer')

export const runConsumer = async () => {
  await consumer.connect()
  await consumer.subscribe({
    topic: KAFKA.CREATE_SUBMISSION_RESULT_MESSAGE_NAME,
    fromBeginning: true,
  })
  logger.info(
    `Kafka consumer subscribed to topic: ${KAFKA.CREATE_SUBMISSION_RESULT_MESSAGE_NAME}`
  )

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      logger.info(`Received job from ${topic}:${partition}`)
      if (!message.value) {
        logger.warn('Received empty Kafka message')
        return
      }

      try {
        const data: CreateSubmissionBody & { ticket_id: string } = JSON.parse(
          message.value.toString()
        )
        const ticketId = message.key?.toString()
        await insertSubmission(data)

        logger.info(`Finished processing job for ticket: ${ticketId}`)
      } catch (error) {
        logger.error(
          `Job processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
        throw error
      }
    },
  })
}
