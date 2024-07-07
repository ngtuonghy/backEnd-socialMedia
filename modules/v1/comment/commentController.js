import { deleteMedia } from "../../../utils/utilCloudnary.js";
import comment from "./commentModel.js";
export async function createComment(req, res) {
  const userId = req.cookies.userId;
  const { postId, text, replyComment, mediaType, mediaUrl, commentId } =
    req.body;
  try {
    await comment.createComment(
      commentId,
      postId,
      userId,
      text,
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
export async function deleteComment(req, res) {
  const { commentId } = req.params;
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
  // console.log(limit, offset);
  try {
    const result = await comment.getComment(postId, limit, offset, commentId);
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
export async function getReplyComment(req, res) {
  const { commentId } = req.params;
  try {
    const result = await comment.getReplyComment(commentId);
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
