import { Router } from "express";
import * as postService from "#src/services/post";
import * as voteService from "#src/services/vote";
import * as commentService from "#src/services/comment";
import verifyJwt from "#src/api/middleware/verifyJwt";
import upload from "#src/api/middleware/upload";
const router = Router();

export default (app) => {
	app.use("/posts", router);

	router.get("/", postService.getAllPost);
	router.get("/users/:username/posts", postService.getPostByUserName);

	router.get("/:postId", postService.getOnePost);
	// router.patch("/:postId", verifyJwt, postController.updatePost);
	router.post("/", verifyJwt, postService.createPost);
	router.delete("/:postId", verifyJwt, postService.deletePost);

	router.patch(
		"/:postId/users/:userId/votes",
		verifyJwt,
		voteService.updateVote,
	);

	router.get("/:postId/votes", voteService.getVote);

	router.get("/:postId/comments", commentService.getComment);
	router.post("/:postId/comments", verifyJwt, commentService.createComment);
	router.delete(
		"/:postId/comments/:commentId",
		verifyJwt,
		commentService.deleteComment,
	);

	router.get(
		"/:postId/comments/:commentId/replies",
		commentService.getReplyComment,
	);
};
