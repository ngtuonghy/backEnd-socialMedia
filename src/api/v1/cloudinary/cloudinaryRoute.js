import { Router } from "express";
import * as cloudinaryService from "#src/services/cloudinary";
import verifyJwt from "../../middleware/verifyJwt.js";
const router = Router();
export default (app) => {
	app.use("/cloudinary", router);
	router.post("/signature", verifyJwt, cloudinaryService.signCloudinary);
	// router.post("/upload", verifyJwt, cloudinaryController.uploadImage);
};
