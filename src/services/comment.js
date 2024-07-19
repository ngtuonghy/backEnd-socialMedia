import comment from "#src/models/comment";
import notification from "#src/models/notification";
import * as db from "#src/utils/pg";
import { deleteMedia } from "#src/utils/cloudnary";
export async function createComment(req, res) {
	const { postId } = req.params;
	const { userId: userCreate } = req.cookies;
	const {
		content,
		user_id: user_notify,
		reply_to_comment_id,
		media_type,
		media_url,
		comment_id,
	} = req.body;

	try {
		await comment.createComment(
			comment_id,
			postId,
			userCreate,
			content,
			reply_to_comment_id,
			media_url,
			media_type,
		);

		if (userCreate === user_notify) {
			return res.status(200).json({
				code: 200,
				message: "success",
			});
		}
		let result;
		if (reply_to_comment_id) {
			const isEnable = await db.query(
				"SELECT notification_enabled FROM comments WHERE comment_id = $1",
				[reply_to_comment_id],
			);
			if (isEnable.rows[0].notification_enabled) {
				const res = await notification.createNotification(
					user_notify,
					userCreate,
					"replied",
					`/posts/${postId}?commentId=${reply_to_comment_id}`,
					{ content },
				);
				result = res.rows[0];
			}
		} else {
			const isEnable = await db.query(
				"SELECT notification_enabled FROM posts WHERE post_id = $1",
				[postId],
			);
			if (isEnable.rows[0].notification_enabled) {
				const res = await notification.createNotification(
					user_notify,
					userCreate,
					"commented",
					`/posts/${postId}`,
					{ content },
				);
				result = res.rows[0];
			}
		}

		return res.status(200).json({
			code: 200,
			data: result,
			message: "success",
		});
	} catch (error) {
		console.log(error);
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
export async function deleteComment(req, res) {
	const { commentId } = req.params;
	const { postId, userId } = req.params;
	try {
		await deleteMedia(commentId, "comment");

		await comment.deleteComment(commentId);
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
export async function getComment(req, res) {
	const { postId } = req.params;
	const limit = parseInt(req.query.limit, 10) || 10; // Mặc định là 10 nếu không có tham số
	const offset = parseInt(req.query.offset, 10) || 0; // Mặc định là 0 nếu không có th
	const commentId = req.query.commentId;
	try {
		const result = await comment.getComment(postId, limit, offset, commentId);
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
export async function getReplyComment(req, res) {
	const { commentId, postId } = req.params;
	try {
		const result = await comment.getReplyComment(commentId);
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
export async function updateComment(req, res) {
	const { commentId, text } = req.body;
	try {
		await comment.updateComment(commentId, text);
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
