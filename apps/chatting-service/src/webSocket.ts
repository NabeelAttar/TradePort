// both sender and receiver of the message need to be in a websocket network for real time, instant messaging. Thats it , websocket
// is only for real time communication, when the user goes offline or the talk stops websocket doesnt stores the message data 
// after this, when a chat again happens then a new socket network is created including both of them, but now how will they see preiovus
// messages as the socket network is new ? we surely cant use database here , 100K users sends requests to send their messages at a single time
// the database cant be surely used for so many requests , it will crash

// so we decide to not store it instantly, maybe after a fix period of time 
// we decide to use kafka midway, when a message is sent from lets say a seller to user through websocket, this websocket sends the message
// to kafka, here websocket is producer that is the sender of the message and we create a kafka consumer for receiving the messages 
// now this kafka consumer will not use its own storage despite having its own storage as it is not similar to our traditional database,
// lets say we use an array=[], empty array, and we will run a setTimeOut kinda function here which runs after every 3 secs, so after
// every 3 secs we will do a batch insertion, that is all the message collected in previous 3 secs will be collected in 1 go, this is
// a scalable approach 

import redis from "@packages/libs/redis"
import { kafka } from "@packages/utils/kafka"
import {WebSocket, WebSocketServer} from 'ws'
import {Server as HttpServer} from 'http'

const producer = kafka.producer()
const connectedUsers: Map<string, WebSocket> = new Map( )
const unseenCounts: Map<string, number> = new Map() // for number os unseen messages, we are using redis for this seen/unseen messages feature

type IncomingMessage = {
    type?: string, //seen or unseen
    fromUserId: string,
    toUserId: string,
    messageBody: string,
    conversationId: string,
    senderType: string,
}
// this describes the structure of the messages coming from the frontend

export async function createWebSocketServer(server:HttpServer) {
    const wss = new WebSocketServer({server}) //this runs the wss on the same port on which this chatting service is running ie 6006, the url will be: wss://localhost:6006

    await producer.connect()
    console.log("kafka producer connected")

    wss.on("connection", (ws: WebSocket) => {
        console.log("New Websocket Connection!")

        let registeredUserId: string | null = null;

        ws.on("message", async (rawMessage) => {
            try {
                const messageStr = rawMessage.toString()

                // register the user on first plain message , (non - json)
                if(!registeredUserId && !messageStr.startsWith("{")){
                    registeredUserId = messageStr   
                    connectedUsers.set(registeredUserId, ws)
                    console.log(`registered websocket for userId: ${registeredUserId}`)

                    // now lets find out if its a seller or a user
                    const isSeller = registeredUserId.startsWith("seller_")
                    const redisKey = isSeller ? `online:seller:${registeredUserId.replace("seller_", "")}` : `online:user:${registeredUserId}`
                    await redis.set(redisKey, "1") //1 says the seller/user is online
                    await redis.expire(redisKey, 300)
                    return
                }

                // process json message
                const data: IncomingMessage = JSON.parse(messageStr)
                
                // if its seen update
                if(data.type === "MARK_AS_SEEN" && registeredUserId){
                    const seenKey = `${registeredUserId}_${data.conversationId}`
                    unseenCounts.set(seenKey, 0)
                    return
                }

                // regular message
                const {fromUserId, toUserId, messageBody, conversationId, senderType} = data
                if(!data || !toUserId || !messageBody || !conversationId){
                    console.warn("Invalid message format:", data)
                }

                const now = new Date().toISOString()
                const messagePayLoad = {
                    conversationId,
                    senderId: fromUserId,
                    senderType,
                    content: messageBody,
                    createdAt: now
                }

                const messageEvent = JSON.stringify({
                    type: "NEW_MESSAGE",
                    payload: messagePayLoad
                })

                const receiverKey = senderType === "user" ? `seller_${toUserId}` : `user_${toUserId}`
                const senderKey = senderType === "user" ? `user_${fromUserId}` : `seller_${fromUserId}`

                // update unseen count dynamically
                const unseenKey = `${receiverKey}_${conversationId}`
                const prevCount = unseenCounts.get(unseenKey) || 0
                unseenCounts.set(unseenKey, prevCount + 1)

                // send new message to receiver
                const receiverSocket = connectedUsers.get(receiverKey)
                if(receiverSocket && receiverSocket.readyState === WebSocket.OPEN){
                    receiverSocket.send(messageEvent)

                    // also notify unseen count
                    receiverSocket.send(JSON.stringify({
                        type: "UNSEEN_COUNT_UPDATE",
                        payload: {
                            conversationId,
                            count: prevCount + 1
                        }
                    }))
                    console.log(`Delivered message + unseen count to ${receiverKey}`)

                } else {
                    console.log(`User ${receiverKey} is offline. Message queued.`)
                }

                // echo to sender 
                const senderSocket = connectedUsers.get(senderKey) 
                if(senderSocket && senderSocket.readyState === WebSocket.OPEN){
                    senderSocket.send(messageEvent)
                    console.log(`Echoed message to sender ${senderKey}`)
                } 

                // push to kafka consumer
                await producer.send({
                    topic: "chat.new_message",
                    messages: [
                        {
                            key: conversationId,
                            value: JSON.stringify(messagePayLoad)
                        }
                    ]
                })

                console.log(`message queued to kafka: ${conversationId}`)

            } catch (error) {
                console.error("Error processing web socket message:", error)
            }
        })
        ws.on("close", async () => {
            if(registeredUserId){
                connectedUsers.delete(registeredUserId)
                console.log(`Disconnected user ${registeredUserId}`)

                const isSeller = registeredUserId.startsWith("seller_")
                const redisKey = isSeller ? `online:seller:${registeredUserId.replace("seller_", "")}` : `online:user:${registeredUserId}`
                await redis.del(redisKey)
            }
        })

        ws.on("error", (err) => {
            console.error("Websocket error: ", err)
        })
    })

    console.log("web socket server is ready")
}