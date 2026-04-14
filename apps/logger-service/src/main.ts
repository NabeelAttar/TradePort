/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import WebSocket from 'ws';
import http from 'http';
import { consumeKafkaMessages } from './logger-consumer';

const app = express();

// creating a websocket server for real time data on admin dashboard 
const wsServer = new WebSocket.Server({noServer: true})

export const clients = new Set<WebSocket>()

wsServer.on("connection", (ws) => {
  console.log("New Logger Client Connected")
  clients.add(ws)

  ws.on("close", () => {
    console.log("Logger client disconnected")
    clients.delete(ws)
  })
})

const server = http.createServer(app)

server.on("upgrade", (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (ws) => {
    wsServer.emit("connection", ws, request)
  })
})

server.listen(process.env.PORT || 6008, () => {
  console.log(`Listening at http://localhost:6008/api`)
})

// start kafka consumer
// for a microservices project like this where many things are going at once we need to maintain logs of actions performed
// we can store these logs on third party apps like elastic search or opensearch, but here we are not storing it on 
// third party apps. Rather, when the admin is active he can see the real time changes on the dashboard but if he is 
// unactive we are storing these logs on kafka 
consumeKafkaMessages()
