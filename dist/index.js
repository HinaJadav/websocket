import express from "express";
import { createServer } from "http";
import "dotenv/config";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
const app = express();
const server = createServer(app);
const port = Number(process.env.PORT) || 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map