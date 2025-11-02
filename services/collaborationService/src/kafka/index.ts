import { Kafka } from 'kafkajs'
import { KAFKA_BROKERS } from '../config/index.js'

const kafka = new Kafka({
  clientId: 'collaboration-service',
  brokers: [KAFKA_BROKERS],
})

export const producer = kafka.producer()

producer
  .connect()
  .catch((e) => console.error('Error connecting Kafka producer', e))
