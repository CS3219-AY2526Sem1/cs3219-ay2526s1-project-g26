/**
 * Source: https://github.com/yjs/y-websocket-server/blob/main/src/callback.js
 *
 * Imported & Modified By: Wu Zengfu
 *
 * License: MIT
 */

import http, { type RequestOptions } from 'http'
import * as Y from 'yjs'
import * as number from 'lib0/number'

import { getLogger } from '../logger.js'
import type { WSSharedDoc } from './index.js'

const logger = getLogger('y-websocket-callback')

const CALLBACK_URL: URL | null = process.env.CALLBACK_URL
  ? new URL(process.env.CALLBACK_URL)
  : null

const CALLBACK_TIMEOUT: number = number.parseInt(
  process.env.CALLBACK_TIMEOUT || '5000'
)

const CALLBACK_OBJECTS: Record<string, string> = process.env.CALLBACK_OBJECTS
  ? JSON.parse(process.env.CALLBACK_OBJECTS)
  : {}

export const isCallbackSet = !!CALLBACK_URL

interface CallbackObject {
  type: string
  content: unknown
}

interface CallbackData {
  room: string
  data: Record<string, CallbackObject>
}

/**
 * @param {import('./utils.js').WSSharedDoc} doc
 */
export const callbackHandler = (doc: WSSharedDoc): void => {
  if (!CALLBACK_URL) {
    return
  }

  const dataToSend: CallbackData = {
    room: doc.name,
    data: {},
  }

  const sharedObjectList = Object.keys(CALLBACK_OBJECTS)

  sharedObjectList.forEach((sharedObjectName) => {
    const sharedObjectType = CALLBACK_OBJECTS[sharedObjectName]
    dataToSend.data[sharedObjectName] = {
      type: sharedObjectType,
      content: getContent(sharedObjectName, sharedObjectType, doc).toJSON(),
    }
  })

  callbackRequest(CALLBACK_URL, CALLBACK_TIMEOUT, dataToSend)
}

/**
 * @param {URL} url
 * @param {number} timeout
 * @param {Object} data
 */
const callbackRequest = (
  url: URL,
  timeout: number,
  data: CallbackData
): void => {
  const dataString = JSON.stringify(data)

  const options: RequestOptions = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname,
    timeout,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(dataString),
    },
  }

  const req = http.request(options)

  req.on('timeout', () => {
    logger.warn('Callback request timed out.')
    req.destroy()
  })

  req.on('error', (e: Error) => {
    logger.error('Callback request error.', e)
    req.destroy()
  })

  req.write(dataString)
  req.end()
}

type YjsSharedType =
  | Y.Array<unknown>
  | Y.Map<unknown>
  | Y.Text
  | Y.XmlFragment
  | Y.XmlElement
/**
 * @param {string} objName
 * @param {string} objType
 * @param {import('./index.ts').WSSharedDoc} doc
 */
const getContent = (
  objName: string,
  objType: string,
  doc: WSSharedDoc
): YjsSharedType => {
  switch (objType) {
    case 'Array':
      return doc.getArray(objName)
    case 'Map':
      return doc.getMap(objName)
    case 'Text':
      return doc.getText(objName)
    case 'XmlFragment':
      return doc.getXmlFragment(objName)
    case 'XmlElement':
      return doc.getXmlElement(objName)
    default:
      // Return an empty Y.Map which has a .toJSON() method.
      // The original code's `return {}` would cause a runtime crash.
      return new Y.Map()
  }
}
