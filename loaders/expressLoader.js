import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import post from "./../modules/v1/post/postRoute.js";
import auth from "./../modules/v1/auth/authRoute.js";
import comment from "./../modules/v1/comment/commentRoute.js";
import user from "./../modules/v1/users/userRoute.js";
import notification from "./../modules/v1/notifications/notificationRoute.js";
import uploadRouter from "../utils/utilUploadthing.js";
import { createRouteHandler } from "uploadthing/express";
import env from "../config/env.js";

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

  app.get("/", (req, res) => {
    res.send("Hello world");
  });
  app.use("/api/v1/posts", post);
  app.use("/api/v1/auth", auth);
  app.use("/api/v1/user", user);
  app.use("/api/v1/comment", comment);
  app.use("/api/v1/notification", notification);
  app.use(
    "/api/uploadthing",
    createRouteHandler({
      router: uploadRouter,
    }),
  );
}
