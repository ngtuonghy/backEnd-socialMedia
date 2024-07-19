import { Router } from "express";
import * as userService from "#src/services/user";
import * as notificationService from "#src/services/notification";
import verifyJwt from "#src/api/middleware/verifyJwt";

const router = Router();

export default (app) => {
	app.use("/users", router);
	router.get("/:identifier", userService.getProfileUser);

	router.post("/:userId/notifications", notificationService.createNotification);

	router.get("/:userId/notifications", notificationService.getNotification);

	router.delete(
		"/:userId/notifications/:notificationId",
		notificationService.deleteNotification,
	);
	router.patch(
		"/:userId/notifications/:notificationId",
		notificationService.updateNotification,
	);

	router.put("/get-signature", verifyJwt, userService.signCloudinary);
	router.put("/updateProfile", verifyJwt, userService.updateProfile);
};
