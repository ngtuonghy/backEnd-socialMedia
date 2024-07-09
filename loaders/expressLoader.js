import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import env from "../config/env.js";
import api from "../api/index.js";

export default function expressLoader(app) {
	app.use(cookieParser());
	app.use(express.json({ limit: "25mb" }));
	app.use(express.urlencoded({ limit: "25mb", extended: true }));
	// app.use(express.json());
	// app.use(express.urlencoded({ extended: true }));

	app.use(
		cors({
			origin: env.clientPort,
			credentials: true,
			optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
		}),
	);

	app.use(api);
}
