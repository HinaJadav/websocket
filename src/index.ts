import express from "express";
import type { Request, Response } from "express";
import { createServer } from "http";
import "dotenv/config";
import {fileURLToPath} from "url";
import {dirname, join} from "path";
import {Server} from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server);  
const port = Number(process.env.PORT) || 3000;

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log('A user connected');

    // socket.on('message', (msg) => {
    //     console.log('Message received: ' + msg);
    // })
socket.on('message', (msg: string) => {
  console.log('Message received: ' + msg);
  io.emit('message', msg); // send to everyone
});
    // socket.on('disconnect', () => {
    //     console.log('A user disconnected');
    // });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});