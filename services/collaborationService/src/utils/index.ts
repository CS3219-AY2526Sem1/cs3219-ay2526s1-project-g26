import * as decoding from 'lib0/decoding'

export const convertUint8Array = (data: Uint8Array): [number, string] => {
  const decoder = decoding.createDecoder(data)
  const messageType = decoding.readVarUint(decoder)
  const textDecoder = new TextDecoder('utf-8')
  const textMessage = textDecoder.decode(decoding.readVarUint8Array(decoder))
  return [messageType, textMessage]
}
