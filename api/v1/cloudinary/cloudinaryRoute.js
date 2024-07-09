import { Router } from "express";
import * as cloudinaryController from "./cloudinaryController.js";
import verifyJwt from "../../middleware/verifyJwt.js";
const router = Router();
export default (app) => {
	app.use("/cloudinary", router);
	router.post("/signature", verifyJwt, cloudinaryController.signCloudinary);
	// router.post("/upload", verifyJwt, cloudinaryController.uploadImage);
};
