import { Router } from "express";
import * as commentController from "./commentController.js";
import verifyJwt from "../../../middleware/verifyJwt.js";
const router = Router();

router.post("/", verifyJwt, commentController.createComment);
router.delete("/:commentId", verifyJwt, commentController.deleteComment);
router.get("/:commentId/replies", commentController.getReplyComment);
router.get("/:postId", commentController.getComment);

export default router;
