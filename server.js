`use strict`

import fs from 'fs'
import express from 'express'
import https from 'https';
import dotenv from 'dotenv'
import session from 'express-session'
import cors from 'cors'
import rateLimit from 'express-rate-limit'

// server's modules.
import security from './components/security'
import talk from './components/talk'

dotenv.config();

const server = express();
server.use(express.json())
server.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  credentials: true,
}));
server.use(session({
  secret: '1@%24^%$3^*&98&^%$',   // 쿠키에 저장할 connect.sid값을 암호화할 키값 입력
  resave: false,                  //세션 아이디를 접속할때마다 새롭게 발급하지 않음
  saveUninitialized: true,        //세션 아이디를 실제 사용하기전에는 발급하지 않음
  cookie: { secure: true }
}));

// throttling
server.use(rateLimit({
  windowMs: 1 * 1 * 60 * 1000, // 1 minute
  max: 100,
  message: 'You have exceeded the 100 requests in 1 min. limit!',
  standardHeaders: true,
  legacyHeaders: false,
}));

// server.set('trust proxy', 1);

const serverIp = process.env.BACKEND_SERVER_IP;
const serverPort = process.env.BACKEND_SERVER_PORT;

if (process.env.BACKEND_SERVER_PROTOCOL === 'http') {
  server.listen(serverPort, serverIp, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${serverIp}:${serverPort}`);
  });
}
else if (process.env.BACKEND_SERVER_PROTOCOL === 'https') {
  var privateKey = fs.readFileSync('cert/key.pem', 'utf8');
  var certificate = fs.readFileSync('cert/cert.pem', 'utf8');
  var credentials = { key: privateKey, cert: certificate };
  var httpsServer = https.createServer(credentials, server);

  httpsServer.listen(serverPort, serverIp, (err) => {
    if (err) throw err;
    console.log(`> Ready on https://${serverIp}:${serverPort}`);
  });
}

server.get('/executeJson', async (req, res) => {
  let txnTime = process.hrtime()
  console.log(`\n>>>>>>>>>>\nSTART TXN:${txnTime}\n`)
  var jResponse = null;
  try {
    console.log(`GET data:${req}`);
    jResponse = await executeService("GET", req);
  }
  catch (e) {
    jResponse = `${e}`;
  }
  finally {
    res.send(`${JSON.stringify(jResponse)}`);
    console.log(`\nEND TXN:${txnTime}\n<<<<<<<<<<<<<<<<<<<<<<<<<\n`)
  }
});

server.post('/executeJson', async (req, res) => {
  let txnTime = process.hrtime()
  console.log(`\n>>>>>>>>>>>>>>>>>>>>>>>>>\nSTART TXN:${txnTime}\n`)
  var jResponse = null;
  try {
    jResponse = await executeService("POST", req);
  }
  catch (e) {
    jResponse = `${e}`;
  }
  finally {
    res.send(`${JSON.stringify(jResponse)}`);
    console.log(`\nEND TXN:${txnTime}\n<<<<<<<<<<<<<<<<<<<<<<<<<\n`)
  }
});

const executeService = async (method, req) => {
  var jRequest = method === "GET" ? JSON.parse(req.params.requestJson) : method === "POST" ? req.body : null;
  var jResponse = null;
  const commandName = jRequest.commandName;
  var remoteIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log(`${method} request: ${JSON.stringify(jRequest)} from ${remoteIp}`);

  if (commandName.startsWith('security.')) {
    jResponse = await new security(req, jRequest);
  }
  else if (commandName.startsWith('talk.')) {
    jResponse = await new talk(req, jRequest);
  }
  else {
    jResponse = JSON.stringify(
      {
        error_code: -1,
        error_message: `[${commandName}] not supported function`
      })
  }

  console.log(`reply: ${JSON.stringify(jResponse)}`);
  return jResponse;
}