import * as db from "./../../../utils/utilPg.js";
const comment = {};

comment.createComment = async (
  commentId,
  postId,
  userId,
  text,
  replyComment,
  mediaUrl,
  mediaType,
) => {
  await db.query(
    `INSERT INTO post_comment (comment_id, post_id, user_id, text, reply_to_comment_id, media_url, media_type) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [commentId, postId, userId, text, replyComment, mediaUrl, mediaType],
  );

  // if (media) {
  //   await db.query(
  //     `INSERT INTO post_comment_media (media_id, post_id , media_type, media_url) VALUES ($1,$2,$3,$4)`,
  //     [mediaId, postId, mediaType, mediaUrl],
  //   );
  // }
};

comment.deleteComment = async (commentId) => {
  await db.query(`DELETE FROM post_comment WHERE comment_id = $1`, [commentId]);
};
comment.getReplyComment = async (commentId) => {
  return await db.query(
    `WITH ReplyCounts AS (
    SELECT 
        reply_to_comment_id,
        COUNT(*) AS reply_count
    FROM 
        post_comment
    WHERE 
        reply_to_comment_id IS NOT NULL
    GROUP BY 
        reply_to_comment_id
)
SELECT 
    post_comment.comment_id,
	  post_comment.reply_to_comment_id,
    post_comment.text,
    post_comment.post_id,
     post_comment.media_url,
    post_comment.media_type,
post_comment.user_id,
    post_comment.created_at,
    user_information.avatar_url,
    user_information.name,
    users.username,
    COALESCE(ReplyCounts.reply_count, 0) AS reply_count
FROM
    post_comment
JOIN 
    user_information ON post_comment.user_id = user_information.user_id
JOIN 
    users ON post_comment.user_id = users.user_id
LEFT JOIN 
    ReplyCounts ON post_comment.comment_id = ReplyCounts.reply_to_comment_id
WHERE 
    post_comment.reply_to_comment_id = $1 
ORDER BY 
    post_comment.created_at DESC`,
    [commentId],
  );
};
comment.getComment = async (postId, limit, offset, commentId) => {
  return await db.query(
    `WITH ReplyCounts AS (
    SELECT 
        reply_to_comment_id,
        COUNT(*) AS reply_count
    FROM 
        post_comment
    WHERE 
        reply_to_comment_id IS NOT NULL
    GROUP BY 
        reply_to_comment_id
)
SELECT 
    post_comment.comment_id,
    post_comment.user_id,
    post_comment.text,
    post_comment.media_url,
    post_comment.media_type,
    post_comment.post_id,
    post_comment.created_at,
    user_information.avatar_url,
    user_information.name,
    users.username,
    COALESCE(ReplyCounts.reply_count, 0) AS reply_count
FROM
    post_comment
JOIN 
    user_information ON post_comment.user_id = user_information.user_id
JOIN 
    users ON post_comment.user_id = users.user_id
LEFT JOIN 
    ReplyCounts ON post_comment.comment_id = ReplyCounts.reply_to_comment_id
 WHERE 
    post_comment.post_id = $1 AND post_comment.reply_to_comment_id IS NULL
ORDER BY 
    post_comment.created_at DESC
LIMIT ${limit}
OFFSET ${offset};`,
    [postId],
  );
};
export default comment;
