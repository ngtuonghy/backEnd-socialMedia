import { Router } from "express";
import * as authService from "#src/services/auth";
import verifyJwt from "#src/api/middleware/verifyJwt";
const router = Router();
export default (app) => {
	app.use("/auth", router);
	router.post("/register", authService.register);
	router.post("/login", authService.login);
	router.post("/logout", authService.logout);
	router.post("/newUserCheck", authService.newUserCheck);
	router.get("/:username", authService.checkUser);
	router.post("/generateOtp", verifyJwt, authService.generateOtp);
	router.post("/verifyOtp", verifyJwt, authService.verifyOtp);
	router.put("/update", verifyJwt, authService.update);

	router.get("/google/callback", authService.oauthGoogle);
	router.get("/github/callback", authService.oauthGithub);
};
