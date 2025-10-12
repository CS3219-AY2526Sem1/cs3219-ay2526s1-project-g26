/**
 * Source: https://github.com/yjs/y-websocket-server/blob/main/src/utils.js
 *
 * Imported & Modified By: Wu Zengfu
 *
 * License: MIT
 */

import * as Y from 'yjs'
// @ts-ignore
import * as syncProtocol from '@y/protocols/sync'
// @ts-ignore
import * as awarenessProtocol from '@y/protocols/awareness'

import * as encoding from 'lib0/encoding'
import * as decoding from 'lib0/decoding'
import * as map from 'lib0/map'
import * as eventloop from 'lib0/eventloop'

import type { WebSocket } from 'ws'
import type { IncomingMessage } from 'http'
import type { Transaction } from 'yjs'

import { callbackHandler, isCallbackSet } from './callback.js'
import { getLogger } from '../logger.js'

const logger = getLogger('y-websocket')

const CALLBACK_DEBOUNCE_WAIT = parseInt(
  process.env.CALLBACK_DEBOUNCE_WAIT || '2000'
)
const CALLBACK_DEBOUNCE_MAXWAIT = parseInt(
  process.env.CALLBACK_DEBOUNCE_MAXWAIT || '10000'
)

const debouncer = eventloop.createDebouncer(
  CALLBACK_DEBOUNCE_WAIT,
  CALLBACK_DEBOUNCE_MAXWAIT
)

const wsReadyStateConnecting = 0
const wsReadyStateOpen = 1

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
const messageEventSwitchLanguage = 4

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

    if (isCallbackSet) {
      this.on('update', (_update, _origin, doc) => {
        debouncer(() => callbackHandler(doc as WSSharedDoc))
      })
    }
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
