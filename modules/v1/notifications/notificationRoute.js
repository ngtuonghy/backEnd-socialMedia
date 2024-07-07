import { Router } from "express";
import * as notificationController from "./notificationController.js";
import verifyJwt from "../../../middleware/verifyJwt.js";
const router = Router();

router.post("/", verifyJwt, notificationController.createNotification);
router.delete(
  "/:notificationId",
  verifyJwt,
  notificationController.deleteNotification,
);
router.patch(
  "/:notificationId",
  verifyJwt,
  notificationController.updateNotification,
);
router.get("/:userId", notificationController.getNotification);

export default router;
