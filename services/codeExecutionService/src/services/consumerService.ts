import { consumer } from '../kafka/index.js'
import { getLogger } from '../utils/logger.js'
import {
  ExecuteCodeRequest,
  Question,
  SubmissionResult,
  Language,
} from '../types/index.js'
import {
  createSubmissionResult,
  getQuestionWithTestCases,
} from './questionService.js'
import { validateCode } from './codeExecutionService.js'

const SUBMISSION_TOPIC = 'code-submissions'
const logger = getLogger('kafkaConsumer')

export const runConsumer = async () => {
  await consumer.connect()
  await consumer.subscribe({ topic: SUBMISSION_TOPIC, fromBeginning: true })
  logger.info(`Kafka consumer subscribed to topic: ${SUBMISSION_TOPIC}`)

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      logger.info(`Received job from ${topic}:${partition}`)
      if (!message.value) {
        logger.warn('Received empty Kafka message')
        return
      }

      try {
        // This is the payload sent by collaborationService
        const job: ExecuteCodeRequest & { ticket_id: string } = JSON.parse(
          message.value.toString()
        )

        const {
          ticket_id, // Use the ticket_id from the message
          question_id,
          language,
          code_text,
          mode,
          user_ids,
        } = job

        // Validation (same as your old route)
        if (!ticket_id || !question_id || !language || !code_text || !mode) {
          logger.warn('Missing required fields in Kafka message', job)
          return // Drop the message
        }

        logger.info(
          `Processing job - Ticket: ${ticket_id}, Question: ${question_id}, Mode: ${mode}`
        )

        // This is the core logic from your old '/execute' route
        // NO setTimeout is needed. Kafka manages the async queue.
        // We *want* this handler to be long-running to process the job.
        const question: Question = await getQuestionWithTestCases(
          question_id,
          mode
        )
        const submissionResult: SubmissionResult = await validateCode(
          question.test_cases,
          language as Language,
          code_text
        )
        const data = {
          result: {
            question_id,
            question_title: question.title,
            categories: question.categories,
            difficulty: question.difficulty,
            code: code_text,
            language: language as Language,
            mode,
            ticket_id: ticket_id, // Use the ticket_id from the job
            overall_result: {
              result: submissionResult.status,
              max_memory_used: submissionResult.memory_used,
              time_taken: submissionResult.execution_time,
              error: submissionResult.error,
              output: submissionResult.output,
              passed_tests: submissionResult.passed_tests,
              total_tests: submissionResult.total_tests,
            },
          },
          user_ids,
        }

        await createSubmissionResult(data)
        logger.info(`Finished processing job for ticket: ${ticket_id}`)
      } catch (error) {
        logger.error(
          `Job processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
        // If we throw here, Kafka will retry the message, which is good
        throw error
      }
    },
  })
}
