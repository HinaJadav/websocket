import express from "express";
import { createServer } from "node:http";
import "dotenv/config";
const app = express();
const server = createServer(app);
const port = Number(process.env.PORT) || 3000;
app.get("/", (req, res) => {
    res.send("Hello from Express!");
});
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map