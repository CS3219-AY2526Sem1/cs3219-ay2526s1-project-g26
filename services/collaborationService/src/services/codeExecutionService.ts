import { KAFKA } from '../constants/index.js'
import { producer } from '../kafka/index.js'
import { getLogger } from '../utils/logger.js'
import { type WSSharedDoc } from '../utils/y-websocket/index.js'

const logger = getLogger('codeExecutionService')

export const submitVerificationJob = async (
  data: { language: string; mode: 'run' | 'submit'; questionId: string },
  doc: WSSharedDoc,
  ticketId: string
) => {
  try {
    const payload = {
      ticket_id: ticketId,
      question_id: data.questionId,
      language: data.language,
      code_text: doc.getText().toString(),
      mode: data.mode,
      user_ids: Array.from(doc.awareness.getStates().values()).map(
        (val) => val.id
      ),
    }

    await producer.send({
      topic: KAFKA.SUBMIT_CODE_MESSAGE_NAME,
      messages: [
        {
          key: ticketId,
          value: JSON.stringify(payload),
        },
      ],
    })

    logger.info(`Submission job sent to Kafka: ${ticketId}`)
  } catch (error) {
    logger.error('Failed to send job to Kafka', error)
  }
}
