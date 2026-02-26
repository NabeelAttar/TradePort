/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser'
import './jobs/payout.job'
import {errorMiddleware} from '@packages/error-handler/error-middleware'
import router from './routes/order.route';

const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true
  })
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
  console.log(`order service is running at http://localhost:${port}/api`);
});
server.on('error', console.error);
