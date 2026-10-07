import express from "express";
import { createServer } from "http";
import "dotenv/config";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Server } from "socket.io";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
const db = await open({
    filename: 'chat.db',
    driver: sqlite3.Database
});
await db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_offset TEXT UNIQUE,
      content TEXT
  );
`);
const app = express();
const server = createServer(app);
const io = new Server(server, {
    connectionStateRecovery: {} // temporaty able to restore user data after disconnect user and reconnect within tim limit
});
const port = Number(process.env.PORT) || 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.on('msgEvent', (msg) => {
        console.log('Message received:', msg);
        //io.emit('msgEvent', msg); // 	All connected clients (including sender)
        socket.broadcast.emit('msgEvent', msg); // All clients except the sender
    });
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
// socket.emit(...)	Only this one client
// io.emit(...)	All connected clients (including sender)
// socket.broadcast.emit(...)	All clients except the sender
// tricks: 
// socket = one person
// io = everyone
// broadcast = everyone except me
//# sourceMappingURL=index_old.js.map