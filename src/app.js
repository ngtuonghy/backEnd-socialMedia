import "dotenv/config";
import express from "express";
import env from "./config/env.js";
import { createServer } from "http";
import loaders from "./loaders/index.js";
const app = express();
const PORT = env.port || 3000;
const httpServer = createServer(app);

const startServer = async () => {
	httpServer.listen(PORT, () => {
		console.log(`API is listening is PORT http://localhost:${PORT}`);
	});
	await loaders(app, httpServer);
};

startServer();
