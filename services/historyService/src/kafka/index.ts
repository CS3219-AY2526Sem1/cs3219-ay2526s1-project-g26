import { Kafka } from 'kafkajs'
import { KAFKA_BROKERS } from '../config/index.js'

const kafka = new Kafka({
  clientId: 'history-service',
  brokers: [KAFKA_BROKERS],
})

export const consumer = kafka.consumer({ groupId: 'history-service-workers' })
