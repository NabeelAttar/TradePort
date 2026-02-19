import { Kafka } from 'kafkajs'

// kafka is a distributed event streaming platform, there are producers and consumers in kafka, producers are the ones which send data
// to kafka and consumers are the ones which receive data from the kafka, kafka topics are like message channels which just specifies
// the messages which are being sent and received are about which topic. now, partition, each topic in kafka is split into partitions
// to handle more data and speed
// broker : is a message broker is a kafka server that stores data and handle requests, multiple brokers = kafka cluster
// kafka offset: its like a bookmark to avoid reading same messages twice 

export const kafka = new Kafka({
    clientId: "kafka-service",
    brokers: ['pkc-l7pr2.ap-south-1.aws.confluent.cloud:9092'],
    ssl: true,
    sasl: {
        mechanism: "plain",
        username: process.env.KAFKA_API_KEY!,
        password: process.env.KAFKA_API_SECRET!,
    }
})