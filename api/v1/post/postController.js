import * as db from "../../../utils/utilPg.js";
import { generatePublicId } from "#root/utils/utilCreateNanoId.js";
import post from "./postModel.js";
import { deleteMedia } from "../../../utils/utilCloudnary.js";
export async function getAllPost(req, res) {
  const userId = req.cookies.userId;
  const limit = parseInt(req.query.limit, 10) || 5;
  const offset = parseInt(req.query.offset, 10) || 0;
  // console.log(limit, offset);
  const result = await post.getAllPost(userId, limit, offset);
  res.status(200).json({
    code: 200,
    data: result.rows,
    message: "success",
  });
  // console.log(result);
  // res.send("this is get all status");
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

export async function createNewPost(req, res) {
  const userId = req.cookies.userId;
  const { visibility, text, imageUrl, postId } = req.body;
  try {
    // const postId = generatePublicId(20);
    await post.createPost(postId, userId, visibility, text);

    for (const file of imageUrl) {
      const mediaId = generatePublicId(20);
      await post.addImage(mediaId, postId, file.mediaType, file.url);
    }

    res.status(200).json({
      code: 200,
      postId,
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
  const postId = req.params.id;
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
      await post.addImage(mediaId, postId, file.mediaType, file.url);
    }

    res.status(200).json({
      code: 200,
      message: "success",
    });
  } catch (error) {
    console.log(error);
  }
}

export async function reactionPost(req, res) {
  const userId = req.cookies.userId;
  const { postId, reaction } = req.body;
  // console.log(req.body);
  if (postId === null || userId === null) {
    return res.status(400).json({
      code: 400,
      message: "error",
    });
  }

  try {
    await post.reactionPost(postId, userId, reaction);
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
