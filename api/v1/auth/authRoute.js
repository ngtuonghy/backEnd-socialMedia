import { Router } from "express";
import * as authController from "./authController.js";
import verifyJwt from "../../middleware/verifyJwt.js";
const router = Router();
export default (app) => {
	app.use("/auth", router);
	router.post("/register", authController.register);
	router.post("/login", authController.login);
	router.post("/logout", authController.logout);
	router.post("/newUserCheck", authController.newUserCheck);
	router.get("/:username", authController.checkUser);
	router.post("/generateOtp", verifyJwt, authController.generateOtp);
	router.post("/verifyOtp", verifyJwt, authController.verifyOtp);
	router.put("/update", verifyJwt, authController.update);

	router.get("/oauth/google", authController.oauthGoogle);
	router.get("/oauth/github", authController.oauthGithub);
};
