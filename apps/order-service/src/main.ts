/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import {errorMiddleware} from '@packages/error-handler/error-middleware'
import router from './routes/order.route';
import { createOrder } from './controllers/order.controller';

const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true
  })
)

// create order ki functionality me order creation is request stripe server ko bhejega but humne extra security layer lagayi h api gateway
// me to humare api gateway wala server stripe ki request ko block kardega , isliye hum create order wala route iss individual server
// that is port 6004 se bhejege instead of through api gateway, 
// so flow will be frontend request(3000) -> 6004 -> stripe -> 6004 -> 3000 (response)
// instead of 3000 -> 8080 -> 6004 -> stripe -> 6004 -> 8080 -> 300
app.post(
  "/api/create-order", 
  bodyParser.raw({ type: "application/json" }), 
  (req, res, next) => {
    (req as any).rawBody = req.body
    next()
  }, 
  createOrder
) 

app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to order-service!' });
});

// routes
app.use("/api", router)

app.use(errorMiddleware)

const port = process.env.PORT || 6004;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
