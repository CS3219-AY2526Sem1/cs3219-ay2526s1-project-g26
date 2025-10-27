import { CODE_EXECUTION_SERVICE_URL } from '../config/index.js'
import { type WSSharedDoc } from '../utils/y-websocket/index.js'

export const verifySubmission = async (
  data: { language: string; mode: 'run' | 'submit'; questionId: string },
  doc: WSSharedDoc
) => {
  const res = await fetch(`${CODE_EXECUTION_SERVICE_URL}/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question_id: data.questionId,
      language: data.language,
      code_text: doc.getText().toString(),
      mode: data.mode,
      user_ids: Array.from(doc.awareness.getStates().values()).map(
        (val) => val.id
      ),
    }),
  })
  if (!res.ok) {
    return null
  }
  const result = (await res.json()) as { success: boolean; ticketId: string }
  return result.ticketId
}
