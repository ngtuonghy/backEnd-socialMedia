import { Router } from "express";
import * as postController from "./postController.js";
import verifyJwt from "../../../middleware/verifyJwt.js";
const router = Router();

router.get("/", postController.getAllPost);
router.get("/user/:userId", postController.getPostByUserName);
router.get("/:postId", postController.getOnePost);
// router.patch("/:postId", verifyJwt, postController.updatePost);
router.post("/", verifyJwt, postController.createNewPost);
router.delete("/:id", verifyJwt, postController.deletePost);

router.patch("/reaction", verifyJwt, postController.reactionPost);

export default router;
