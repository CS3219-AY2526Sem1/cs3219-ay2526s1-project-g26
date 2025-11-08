import { consumer, producer } from '../kafka/index.js'
import { getLogger } from '../utils/logger.js'
import {
  ExecuteCodeRequest,
  Question,
  SubmissionResult,
  Language,
} from '../types/index.js'
import { getQuestionWithTestCases } from './questionService.js'
import { validateCode } from './codeExecutionService.js'
import { KAFKA } from '../constants/index.js'

const logger = getLogger('kafkaConsumer')

export const runConsumer = async () => {
  await consumer.connect()
  await consumer.subscribe({
    topic: KAFKA.SUBMIT_CODE_MESSAGE_NAME,
    fromBeginning: true,
  })
  logger.info(
    `Kafka consumer subscribed to topic: ${KAFKA.SUBMIT_CODE_MESSAGE_NAME}`
  )

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      logger.info(`Received job from ${topic}:${partition}`)
      if (!message.value) {
        logger.warn('Received empty Kafka message')
        return
      }

      try {
        const job: ExecuteCodeRequest & { ticket_id: string } = JSON.parse(
          message.value.toString()
        )

        const { ticket_id, question_id, language, code_text, mode, room_id, user_ids } =
          job

        if (!ticket_id || !room_id || !question_id || !language || !code_text || !mode) {
          logger.warn('Missing required fields in Kafka message', job)
          return
        }

        logger.info(
          `Processing job - Ticket: ${ticket_id}, Question: ${question_id}, Mode: ${mode}`
        )

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
            ticket_id: ticket_id,
            overall_result: {
              result: submissionResult.status,
              max_memory_used: submissionResult.memory_used,
              time_taken: submissionResult.execution_time,
              error: submissionResult.error,
              output: submissionResult.output,
              passed_tests: submissionResult.passed_tests,
              total_tests: submissionResult.total_tests,
              test_case_details: submissionResult.test_case_details,
            },
          },
          room_id,
          user_ids,
        }

        await producer.send({
          topic: KAFKA.CREATE_SUBMISSION_RESULT_MESSAGE_NAME,
          messages: [
            {
              key: ticket_id,
              value: JSON.stringify(data),
            },
          ],
        })
        logger.info(`Finished processing job for ticket: ${ticket_id}`)
      } catch (error) {
        logger.error(
          `Job processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
        throw error
      }
    },
  })
}
