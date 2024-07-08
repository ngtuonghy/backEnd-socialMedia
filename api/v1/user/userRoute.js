import { Router } from "express";
import * as userController from "./userController.js";
import verifyJwt from "../../middleware/verifyJwt.js";
const router = Router();
export default (app) => {
	app.use("/users", router);
	router.get("/:identifier", userController.getProfileUser);
	router.put("/get-signature", verifyJwt, userController.signCloudinary);
	router.put("/updateProfile", verifyJwt, userController.updateProfile);
};
