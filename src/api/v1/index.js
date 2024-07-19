import post from "#src/api/v1/post/postRoute";
import auth from "./auth/authRoute.js";
import user from "./user/userRoute.js";
import cloudinary from "./cloudinary/cloudinaryRoute.js";
import { Router } from "express";

const v1 = Router();

post(v1);
user(v1);
auth(v1);
cloudinary(v1);

export default v1;
