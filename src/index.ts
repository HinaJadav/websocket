import express from "express";
import { createServer } from "http";
import "dotenv/config";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Server } from "socket.io";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { availableParallelism } from "os";
import cluster from "cluster";
import { createAdapter, setupPrimary } from "@socket.io/cluster-adapter";

if (cluster.isPrimary) {
  const numCPUs = availableParallelism();

  // one worker per CPU core, each on its own port
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork({ PORT: String(3000 + i) });
  }

  setupPrimary(); // adapter setup for the primary process
} else {
  // database is opened only in workers
  const db = await open({
    filename: "chat.db",
    driver: sqlite3.Database,
  });

  // let several processes share the file safely
  await db.exec("PRAGMA journal_mode = WAL;");
  await db.exec("PRAGMA busy_timeout = 5000;");

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
    connectionStateRecovery: {},
    adapter: createAdapter(), // adapter setup for each worker
  });

  const port = process.env.PORT;
  const __dirname = dirname(fileURLToPath(import.meta.url));

  app.get("/", (req, res) => {
    res.sendFile(join(__dirname, "index.html"));
  });

  io.on("connection", async (socket) => {
    socket.on("msgEvent", async (msg: string) => {
      try {
        const result = await db.run("INSERT INTO messages (content) VALUES (?)", msg);
        io.emit("msgEvent", msg, result.lastID);
      } catch (error) {
        console.error("insert failed:", error);
      }
    });

    if (!socket.recovered) {
      try {
        await db.each(
          "SELECT id, content FROM messages WHERE id > ?",
          [socket.handshake.auth.serverOffset || 0],
          (_err, row) => {
            socket.emit("msgEvent", row.content, row.id);
          }
        );
      } catch (error) {
        console.error("history failed:", error);
      }
    }
  });

  server.listen(port, () => {
    console.log(`Worker ${process.pid} running at http://localhost:${port}`);
  });
}