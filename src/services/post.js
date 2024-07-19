import post from "#src/models/post";
import { deleteMedia } from "#src/utils/cloudnary";
import { generatePublicId } from "#src/utils/createNanoId";

export async function getAllPost(req, res) {
	const userId = req.cookies.userId;
	const limit = parseInt(req.query.limit, 10) || 5;
	const offset = parseInt(req.query.offset, 10) || 0;
	const username = req.query.username;

	try {
		const result = await post.getAllPost(userId, limit, offset, username);
		res.status(200).json({
			code: 200,
			data: result.rows,
			message: "success",
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			code: 500,
			message: "error",
		});
	}
}
export async function getPostByUserName(req, res) {
	const userId = req.cookies.userId;
	const userName = req.params.userId;
	// console.log(userName);
	try {
		const result = await post.getPostByUserName(userId, userName);
		// console.log(result);
		res.status(200).json({
			code: 200,
			data: result.rows,
			message: "success",
		});
	} catch (error) {
		console.log(error);
	}
}

export async function getOnePost(req, res) {
	const postId = req.params.postId;
	const userId = req.cookies.userId;
	if (postId === undefined || null) {
		return res.status(400).json({
			code: 400,
			message: "error",
		});
	}
	console.log(postId);
	try {
		const result = await post.getPostById(userId, postId);
		console.log(result.rows);
		res.status(200).json({
			code: 200,
			data: result.rows[0],
			message: "success",
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			code: 500,
			message: "error",
		});
	}
}

export async function createPost(req, res) {
	const userId = req.cookies.userId;
	const { privacy, content, media } = req.body;
	try {
		const postId = generatePublicId(22);
		const result = await post.createPost(postId, userId, privacy, content);
		let media_create = [];
		let media_urls = [];
		media.forEach(async (m, index) => {
			// console.log(image);
			media_urls.push({
				media_url: `post/${postId}_media${index}`,
				media_type: m.media_type,
			});
			media_create.push({ media_url: `${postId}_media${index}` });

			await post.createMedia(
				userId,
				postId,
				m.media_type,
				`post/${postId}_media${index}`,
			);
		});

		res.status(200).json({
			code: 200,
			data: {
				media_create: media_create,
				media_urls: media_urls,
				...result.rows[0],
			},
			message: "success",
		});
	} catch (error) {
		res.status(500).json({
			code: 500,
			message: "error",
		});
		console.log(error);
	}
}
export async function deletePost(req, res) {
	const postId = req.params.postId;
	console.log(req.params);
	try {
		await deleteMedia(postId, "post");
		await post.deletePost(postId);
		res.status(200).json({
			code: 200,
			message: "success",
		});
	} catch (error) {
		console.log(error);
	}
}
export async function updatePost(req, res) {
	const { imageUrl } = req.body;
	const postId = req.params.postId;
	// console.log(req.body);
	try {
		for (const file of imageUrl) {
			const mediaId = generatePublicId(20);
			await post.createMedia(mediaId, postId, file.mediaType, file.url);
		}

		res.status(200).json({
			code: 200,
			message: "success",
		});
	} catch (error) {
		console.log(error);
	}
}

export async function createReaction(req, res) {
	const userId = req.cookies.userId;
	const { reactionType } = req.body;
	const { postId } = req.params;

	if (postId === null || userId === null) {
		return res.status(400).json({
			code: "400",
			message: "Bad Request: postId and userId are required.",
		});
	}

	try {
		await reaction.reactionPost(postId, userId, reactionType);
		res.status(200).json({
			code: 200,
			message: "success",
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			code: 500,
			message: "error",
		});
	}
}

export async function createComment(req, res) {
	const userId = req.cookies.userId;
	const { postId } = req.params;
	const { content, replyComment, mediaType, mediaUrl, commentId } = req.body;
	try {
		await post.createComment(
			commentId,
			postId,
			userId,
			content,
			replyComment,
			mediaUrl,
			mediaType,
		);
		res.status(200).json({
			code: 200,
			message: "success",
		});
	} catch (error) {
		if (error.code === "23503") {
			return res.status(422).json({
				code: 422,
				message: "This comment is already exists",
			});
		}
		console.log(error);
		res.status(500).json({
			code: 500,
			message: "error",
		});
	}
}
export async function getComment(req, res) {
	const { postId } = req.params;
	const limit = parseInt(req.query.limit, 10) || 10;
	const offset = parseInt(req.query.offset, 10) || 0;
	const commentId = req.query.commentId;
	try {
		const result = await post.getComment(postId, limit, offset, commentId);
		res.status(200).json({
			code: 200,
			data: result.rows,
			message: "success",
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			code: 500,
			message: "error",
		});
	}
}

export async function deleteComment(req, res) {
	const { commentId, postId } = req.params;
	try {
		await deleteMedia(commentId, "comment");

		await post.deleteComment(commentId, postId);
		res.status(200).json({
			code: 200,
			message: "success",
		});
	} catch (error) {
		res.status(500).json({
			code: 500,
			message: "error",
		});
	}
}

export async function getReplyComment(req, res) {
	const { commentId } = req.params;
	try {
		const result = await post.getReplyComment(commentId);
		res.status(200).json({
			code: 200,
			data: result.rows,
			message: "success",
		});
	} catch (error) {
		res.status(500).json({
			code: 500,
			message: "error",
		});
	}
}
export async function updateComment(req, res) {
	const { commentId, text } = req.body;
	try {
		await post.updateComment(commentId, text);
		res.status(200).json({
			code: 200,
			message: "success",
		});
	} catch (error) {
		res.status(500).json({
			code: 500,
			message: "error",
		});
	}
}
