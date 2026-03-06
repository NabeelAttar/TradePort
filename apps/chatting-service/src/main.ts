/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import cookieParser from 'cookie-parser'
import { createWebSocketServer } from './webSocket';
import { startConsumer } from './chat-message.consumer';

const app = express();

app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to chatting-service!' });
});

const port = process.env.PORT || 6006;

const server = app.listen(port, () => {
  console.log(`Chatting service running at http://localhost:${port}/api`);
});

// connect websocket server 
createWebSocketServer(server)

// start kafka consumer
startConsumer().catch((error:any) => {
  console.log(error)
})

server.on('error', console.error);
