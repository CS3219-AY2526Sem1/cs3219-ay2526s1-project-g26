/**
 * This file was modified based on y-websocket source code, originally authored by Kevin Jahns <kevin.jahns@protonmail.com>
 * under the MIT license. Modified and imported by Wu Zengfu <https://github.com/wuzengfu>.
 *
 * Original Source: https://github.com/yjs/y-websocket-server/blob/v1.4.5/bin/utils.js
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 Kevin Jahns <kevin.jahns@protonmail.com>.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import * as Y from 'yjs'
// @ts-ignore
import * as syncProtocol from '@y/protocols/sync'
// @ts-ignore
import * as awarenessProtocol from '@y/protocols/awareness'

import * as encoding from 'lib0/encoding'
import * as decoding from 'lib0/decoding'
import * as map from 'lib0/map'

import type { WebSocket } from 'ws'
import type { IncomingMessage } from 'http'
import type { Transaction } from 'yjs'

import { convertUint8Array } from '../index.js'

import { getLogger } from '../logger.js'
import { verifySubmission } from '../../services/codeExecutionService.js'

const logger = getLogger('y-websocket')

const wsReadyStateConnecting = 0
const wsReadyStateOpen = 1
const wsReadyStateClosing = 2 // eslint-disable-line
const wsReadyStateClosed = 3 // eslint-disable-line

// disable gc when using snapshots!
const gcEnabled = process.env.GC !== 'false' && process.env.GC !== '0'

export interface IPersistence {
  bindState: (docName: string, ydoc: WSSharedDoc) => void
  writeState: (docName: string, ydoc: WSSharedDoc) => Promise<unknown>
  provider: unknown
}

let persistence: IPersistence | null = null

/**
 * @param {{bindState: function(string,WSSharedDoc):void,
 * writeState:function(string,WSSharedDoc):Promise<any>,provider:any}|null} persistence_
 */
export const setPersistence = (persistence_: IPersistence | null): void => {
  persistence = persistence_
}

/**
 * @return {null|{bindState: function(string,WSSharedDoc):void,
 * writeState:function(string,WSSharedDoc):Promise<any>}|null} used persistence layer
 */
export const getPersistence = (): IPersistence | null => persistence

/**
 * @type {Map<string,WSSharedDoc>}
 */
export const docs = new Map<string, WSSharedDoc>()

const messageSync = 0
const messageAwareness = 1
// const messageAuth = 2
// const messageQueryAwareness = 3
const messageEventSwitchLanguage = 4
const messageEventCodeSubmitted = 5
const messageEventSessionExit = 6

/**
 * @param {Uint8Array} update
 * @param {any} _origin
 * @param {WSSharedDoc} doc
 * @param {any} _tr
 */
const updateHandler = (
  update: Uint8Array,
  _origin: unknown,
  doc: WSSharedDoc,
  _tr: Transaction
): void => {
  const encoder = encoding.createEncoder()
  encoding.writeVarUint(encoder, messageSync)
  syncProtocol.writeUpdate(encoder, update)
  const message = encoding.toUint8Array(encoder)
  doc.conns.forEach((_, conn) => send(doc, conn, message))
}

/**
 * @type {(ydoc: Y.Doc) => Promise<void>}
 */
let contentInitializor = (_ydoc: Y.Doc): Promise<void> => Promise.resolve()

/**
 * This function is called once every time a Yjs document is created. You can
 * use it to pull data from an external source or initialize content.
 *
 * @param {(ydoc: Y.Doc) => Promise<void>} f
 */
export const setContentInitializor = (
  f: (ydoc: Y.Doc) => Promise<void>
): void => {
  contentInitializor = f
}

export class WSSharedDoc extends Y.Doc {
  public name: string
  public conns: Map<WebSocket, Set<number>>
  public awareness: awarenessProtocol.Awareness
  public whenInitialized: Promise<void>

  constructor(name: string) {
    super({ gc: gcEnabled })
    this.name = name
    /**
     * Maps from conn to set of controlled user ids. Delete all user ids from awareness when this conn is closed
     * @type {Map<Object, Set<number>>}
     */
    this.conns = new Map<WebSocket, Set<number>>()
    /**
     * @type {awarenessProtocol.Awareness}
     */
    this.awareness = new awarenessProtocol.Awareness(this)
    this.awareness.setLocalState(null)

    /**
     * @param {{ added: Array<number>, updated: Array<number>, removed: Array<number> }} changes
     * @param {Object | null} conn Origin is the connection that made the change
     */
    const awarenessChangeHandler = (
      {
        added,
        updated,
        removed,
      }: { added: number[]; updated: number[]; removed: number[] },
      conn: WebSocket | null
    ) => {
      const changedClients = added.concat(updated, removed)
      if (conn !== null) {
        const connControlledIDs = this.conns.get(conn)
        if (connControlledIDs !== undefined) {
          added.forEach((clientID) => {
            connControlledIDs.add(clientID)
          })
          removed.forEach((clientID) => {
            connControlledIDs.delete(clientID)
          })
        }
      }
      // broadcast awareness update
      const encoder = encoding.createEncoder()
      encoding.writeVarUint(encoder, messageAwareness)
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients)
      )
      const buff = encoding.toUint8Array(encoder)
      this.conns.forEach((_, c) => {
        send(this, c, buff)
      })
    }
    this.awareness.on('update', awarenessChangeHandler)

    this.on('update', updateHandler as never)

    this.whenInitialized = contentInitializor(this)
  }
}

/**
 * Gets a Y.Doc by name, whether in memory or on disk
 *
 * @param {string} docname - the name of the Y.Doc to find or create
 * @param {boolean} gc - whether to allow gc on the doc (applies only when created)
 * @return {WSSharedDoc}
 */
export const getYDoc = (docname: string, gc: boolean = true): WSSharedDoc =>
  map.setIfUndefined(docs, docname, () => {
    const doc = new WSSharedDoc(docname)
    doc.gc = gc
    if (persistence !== null) {
      persistence.bindState(docname, doc)
    }
    docs.set(docname, doc)
    return doc
  })

/**
 * @param {any} conn
 * @param {WSSharedDoc} doc
 * @param {Uint8Array} message
 */
const messageListener = (
  conn: WebSocket,
  doc: WSSharedDoc,
  message: Uint8Array
): void => {
  try {
    const encoder = encoding.createEncoder()
    const decoder = decoding.createDecoder(message)
    const messageType = decoding.readVarUint(decoder)
    switch (messageType) {
      case messageSync:
        encoding.writeVarUint(encoder, messageSync)
        syncProtocol.readSyncMessage(decoder, encoder, doc, conn)

        // If the `encoder` only contains the type of reply message and no
        // message, there is no need to send the message. When `encoder` only
        // contains the type of reply, its length is 1.
        if (encoding.length(encoder) > 1) {
          send(doc, conn, encoding.toUint8Array(encoder))
        }
        break
      case messageAwareness:
        awarenessProtocol.applyAwarenessUpdate(
          doc.awareness,
          decoding.readVarUint8Array(decoder),
          conn
        )
        break

      case messageEventSwitchLanguage:
        doc.conns.forEach((_: Set<number>, socket: WebSocket) => {
          if (socket === conn) return
          socket.send(message)
        })
        break
      case messageEventCodeSubmitted:
        {
          encoding.writeVarUint(encoder, messageEventCodeSubmitted)
          const [_, textMessage] = convertUint8Array(message)
          const data = JSON.parse(textMessage)
          verifySubmission(data, doc).then((ticketId: string | null) => {
            encoding.writeVarUint8Array(
              encoder,
              new TextEncoder().encode(ticketId || '')
            )
            doc.conns.forEach((_: Set<number>, socket: WebSocket) => {
              socket.send(encoding.toUint8Array(encoder))
            })
          })
        }
        break
      case messageEventSessionExit:
        {
          doc.conns.forEach((_: Set<number>, socket: WebSocket) => {
            socket.send(message)
          })
        }
        break
    }
  } catch (err) {
    logger.error(err)
    // @ts-ignore
    doc.emit('error', [err])
  }
}

/**
 * @param {WSSharedDoc} doc
 * @param {any} conn
 */
const closeConn = (doc: WSSharedDoc, conn: WebSocket): void => {
  if (doc.conns.has(conn)) {
    /**
     * @type {Set<number>}
     */
    // @ts-ignore
    const controlledIds = doc.conns.get(conn)!
    doc.conns.delete(conn)
    awarenessProtocol.removeAwarenessStates(
      doc.awareness,
      Array.from(controlledIds),
      null
    )
    if (doc.conns.size === 0 && persistence !== null) {
      // if persisted, we store state and destroy ydocument
      persistence.writeState(doc.name, doc).then(() => {
        doc.destroy()
      })
      docs.delete(doc.name)
    }
  }
  conn.close()
}

/**
 * @param {WSSharedDoc} doc
 * @param {import('ws').WebSocket} conn
 * @param {Uint8Array} m
 */
const send = (doc: WSSharedDoc, conn: WebSocket, m: Uint8Array): void => {
  if (
    conn.readyState !== wsReadyStateConnecting &&
    conn.readyState !== wsReadyStateOpen
  ) {
    closeConn(doc, conn)
  }
  try {
    conn.send(m, {}, (err) => {
      if (err != null) {
        closeConn(doc, conn)
      }
    })
  } catch (_e) {
    closeConn(doc, conn)
  }
}

const pingTimeout = 30000

interface ConnectionOptions {
  docName?: string
  gc?: boolean
}

/**
 * @param {import('ws').WebSocket} conn
 * @param {import('http').IncomingMessage} req
 * @param {any} opts
 */
export const setupWSConnection = (
  conn: WebSocket,
  req: IncomingMessage,
  {
    docName = (req.url || '').slice(1).split('?')[0],
    gc = true,
  }: ConnectionOptions = {}
): void => {
  conn.binaryType = 'arraybuffer'
  // get doc, initialize if it does not exist yet
  const doc = getYDoc(docName, gc)
  doc.conns.set(conn, new Set())
  // listen and reply to events
  conn.on('message', (message: ArrayBuffer) =>
    messageListener(conn, doc, new Uint8Array(message))
  )

  // Check if connection is still alive
  let pongReceived = true
  const pingInterval = setInterval(() => {
    if (!pongReceived) {
      if (doc.conns.has(conn)) {
        closeConn(doc, conn)
      }
      clearInterval(pingInterval)
    } else if (doc.conns.has(conn)) {
      pongReceived = false
      try {
        conn.ping()
      } catch (_e) {
        closeConn(doc, conn)
        clearInterval(pingInterval)
      }
    }
  }, pingTimeout)

  conn.on('close', () => {
    closeConn(doc, conn)
    clearInterval(pingInterval)
  })

  conn.on('pong', () => {
    pongReceived = true
  })

  // put the following in a variables in a block so the interval handlers don't keep in in
  // scope
  {
    // send sync step 1
    const encoder = encoding.createEncoder()
    encoding.writeVarUint(encoder, messageSync)
    syncProtocol.writeSyncStep1(encoder, doc)
    send(doc, conn, encoding.toUint8Array(encoder))

    const awarenessStates = doc.awareness.getStates()
    if (awarenessStates.size > 0) {
      const encoderAwareness = encoding.createEncoder()
      encoding.writeVarUint(encoderAwareness, messageAwareness)
      encoding.writeVarUint8Array(
        encoderAwareness,
        awarenessProtocol.encodeAwarenessUpdate(
          doc.awareness,
          Array.from(awarenessStates.keys())
        )
      )
      send(doc, conn, encoding.toUint8Array(encoderAwareness))
    }
  }
}
