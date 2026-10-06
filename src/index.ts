import express from "express";
import type { Request, Response } from "express";
import { createServer } from "node:http";
import "dotenv/config";

const app = express();
const server = createServer(app);
const port = Number(process.env.PORT) || 3000;

app.get("/", (req: Request, res: Response): void => {
  res.send("Hello from Express!");
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});