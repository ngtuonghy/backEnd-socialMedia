import post from "./post/postRoute.js";
import auth from "./auth/authRoute.js";
import comment from "./comment/commentRoute.js";
import user from "./user/userRoute.js";
import notification from "./notifications/notificationRoute.js";
import { Router } from "express";

const v1 = Router();

post(v1);
user(v1);
auth(v1);
notification(v1);
comment(v1);

export default v1;
