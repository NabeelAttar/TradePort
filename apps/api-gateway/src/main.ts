// api gateway acts as a middleman. in microservices the project is split into many different services and each service is running on a 
// different port, but in the frontend we can send requests to different port, so only this port i.e. 8080 specified here will receive
// the requests and this port will act as a middleman and transfer the requests to specific service's ports, and for this i.e for connecting
// all this services into a prpxy server we will install a library - express-http-proxy - express middleware to proxy request to another 
// host and pass response back to original caller. 

import express from 'express';
import cors from 'cors'
import proxy from 'express-http-proxy'
import morgan from 'morgan'
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express' 
import axios from 'axios';
import cookieParser from 'cookie-parser'
import initializeSiteConfig from './libs/initializeSiteConfig';


const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"], //port 3000 will be our frontend, meaning cors should only allow requests from this port 
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  })
);

app.use(morgan("dev")); //Morgan is an HTTP request logger for Express.
app.use(express.json({limit: "100mb"})); //json data limit, if this limit exceeds 100mb it could be ddos attack hence we are blocking requests with higher json data
app.use(express.urlencoded({ limit: "100mb", extended: true})); //extended true se complex nested objects likh sakta hai
app.use(cookieParser());
app.set("trust proxy", 1);

// apply rate limiting, 
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, //window lasts for 15 minutes
  max: (req: any) => (req.user ? 1000 : 100), //if user is loggedin then allow 1000 requests or else 100 requests
  message: {error: "Too Many Requests, Please try again later!"},
  standardHeaders: true,
  legacyHeaders: true,
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? req.socket.remoteAddress ?? "unknown"), //define this limiter for a specific ip 
});

app.use(limiter);

app.get('/gateway-health', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
});

app.use('/product', proxy('http://127.0.0.1:6002'));
app.use('/', proxy('http://localhost:6001'));

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
  try {
    initializeSiteConfig();
    console.log("Site Config Initialized Successfully!")
  } catch (error) {
    console.log("Failed to initialise site config")
  }
});
server.on('error', console.error);
