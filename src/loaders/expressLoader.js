import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import env from "../config/env.js";
import api from "../api/index.js";
import * as user from "#src/models/userManager";
import { Server } from "socket.io";

export default function expressLoader(app, httpServer) {
	// socketLoader(httpServer, app);
	// const io = new Server(httpServer, {
	// 	cors: {
	// 		origin: env.APP_URL,
	// 		credentials: true,
	// 		methods: ["GET", "POST"],
	// 	},
	// });
	//
	// io.on("connection", (socket) => {
	// 	socket.on("addUser", (userId) => {
	// 		user.addUser(userId, socket.id);
	// 		console.log(user.user);
	// 	});
	// 	socket.on("disconnect", () => {
	// 		user.removeUser(socket.id);
	// 	});
	// });
	//
	// app.use((req, res, next) => {
	// 	res.io = io;
	// 	return next();
	// });

	/// expressLoader.js

	app.use(cookieParser());
	app.use(express.json({ limit: "25mb" }));
	app.use(express.urlencoded({ limit: "25mb", extended: true }));

	// app.use(express.json());
	// app.use(express.urlencoded({ extended: true }));

	app.use(
		cors({
			origin: env.APP_URL,
			credentials: true,
			optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
		}),
	);

	app.use(api);

	app.use((err, req, res, next) => {
		const errStatus = err.code || 500;
		const errMsg = err.message || "Something went wrong";
		res.status(errStatus).json({
			code: errStatus,
			message: errMsg,
			stack: process.env.NODE_ENV === "development" ? err.stack : {},
		});
	});
}
