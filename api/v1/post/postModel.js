import * as db from "./../../../utils/utilPg.js";
const post = {};

post.getAllPost = async (userId, limit, offset) => {
  return await db.query(
    `SELECT
    posts.post_id,
    posts.user_id,
    users.username,
  	user_information.avatar_url,
  	user_information.name,
    posts.visibility,
    posts.text,
    posts.created_at,
	 (
        SELECT 
            json_agg(json_build_object('src', m.media_url, 'type', m.media_type))
        FROM 
            media m
        WHERE 
            m.post_id = posts.post_id
    ) AS media_urls,
	COUNT(DISTINCT post_comment) AS comment_count,
	COUNT(DISTINCT post_reaction.reaction) AS reaction_count,
    (
        SELECT 
            json_agg(json_build_object('reaction', reaction, 'count', reaction_count))
        FROM (
            SELECT 
                pr.reaction,
                COUNT(pr.reaction) AS reaction_count
            FROM 
                post_reaction pr
            WHERE 
                pr.post_id = posts.post_id
            GROUP BY 
                pr.reaction
            ORDER BY 
                reaction_count DESC
            LIMIT 3
        ) AS top_reactions
    ) AS top_reactions,
	 (
        SELECT 
           pr.reaction
        FROM 
            post_reaction pr
        WHERE 
            pr.post_id = posts.post_id
            AND pr.user_id = $1
    ) AS current_user_reaction
FROM 
    posts
JOIN 
    media ON posts.post_id = media.post_id
JOIN 
    user_information ON posts.user_id = user_information.user_id
JOIN
    users ON posts.user_id = users.user_id
LEFT JOIN 
    post_reaction ON posts.post_id = post_reaction.post_id
LEFT JOIN 
    post_comment ON posts.post_id = post_comment.post_id
WHERE 
    posts.visibility IN ('public', 'friends')
GROUP BY
 	user_information.name, users.username, user_information.avatar_url, posts.post_id,
	posts.user_id, posts.visibility, posts.text, posts.created_at
ORDER BY 
    posts.created_at DESC
LIMIT ${limit}
OFFSET ${offset};`,
    [userId],
  );
};

post.createPost = async (postId, userId, visibility, text) => {
  await db.query(
    `INSERT INTO posts (post_id, user_id, visibility, text) VALUES ($1,$2,$3,$4)`,
    [postId, userId, visibility, text],
  );
};
post.deletePost = async (postId) => {
  await db.query(`DELETE FROM posts WHERE post_id = $1`, [postId]);
};
post.addImage = async (mediaId, postId, mediaType, mediaUrl) => {
  await db.query(
    `INSERT INTO media (media_id, post_id , media_type, media_url) VALUES ($1,$2,$3,$4)`,
    [mediaId, postId, mediaType, mediaUrl],
  );
};

post.getPostById = async (userId, postId) => {
  return await db.query(
    `SELECT
    posts.post_id,
    posts.user_id,
    users.username,
  	user_information.avatar_url,
  	user_information.name,
    posts.visibility,
    posts.text,
    posts.created_at,
	 (
        SELECT 
            json_agg(json_build_object('src', m.media_url, 'type', m.media_type))
        FROM 
            media m
        WHERE 
            m.post_id = posts.post_id
    ) AS media_urls,
	COUNT(DISTINCT post_comment) AS comment_count,
	COUNT(DISTINCT post_reaction.reaction) AS reaction_count,
    (
        SELECT 
            json_agg(json_build_object('reaction', reaction, 'count', reaction_count))
        FROM (
            SELECT 
                pr.reaction,
                COUNT(pr.reaction) AS reaction_count
            FROM 
                post_reaction pr
            WHERE 
                pr.post_id = posts.post_id
            GROUP BY 
                pr.reaction
            ORDER BY 
                reaction_count DESC
            LIMIT 3
        ) AS top_reactions
    ) AS top_reactions,
	 (
        SELECT 
           pr.reaction
        FROM 
            post_reaction pr
        WHERE 
            pr.post_id = posts.post_id
            AND pr.user_id = $1
    ) AS current_user_reaction
FROM 
    posts
JOIN 
    media ON posts.post_id = media.post_id
JOIN 
    user_information ON posts.user_id = user_information.user_id
JOIN
    users ON posts.user_id = users.user_id
LEFT JOIN 
    post_reaction ON posts.post_id = post_reaction.post_id
LEFT JOIN 
    post_comment ON posts.post_id = post_comment.post_id
WHERE 
    posts.post_id = $2
GROUP BY
 	user_information.name, users.username, user_information.avatar_url, posts.post_id,
	posts.user_id, posts.visibility, posts.text, posts.created_at;`,
    [userId, postId],
  );
};

post.getPostByUserName = async (userId, userName) => {
  return await db.query(
    `SELECT
    posts.post_id,
    posts.user_id,
    users.username,
	  user_information.avatar_url,
	  user_information.name,
    posts.visibility,
    posts.text,
    posts.created_at,
	 (
        SELECT 
            json_agg(json_build_object('src', m.media_url, 'type', m.media_type))
        FROM 
            media m
        WHERE 
            m.post_id = posts.post_id
    ) AS media_urls,
	COUNT(DISTINCT post_comment) AS comment_count,
	COUNT(DISTINCT post_reaction.reaction) AS reaction_count,
    (
        SELECT 
            json_agg(json_build_object('reaction', reaction, 'count', reaction_count))
        FROM (
            SELECT 
                pr.reaction,
                COUNT(pr.reaction) AS reaction_count
            FROM 
                post_reaction pr
            WHERE 
                pr.post_id = posts.post_id
            GROUP BY 
                pr.reaction
            ORDER BY 
                reaction_count DESC
            LIMIT 3
        ) AS top_reactions
    ) AS top_reactions,
	 (
        SELECT 
           pr.reaction
        FROM 
            post_reaction pr
        WHERE 
            pr.post_id = posts.post_id
            AND pr.user_id = $1
    ) AS current_user_reaction
FROM 
    posts
JOIN 
    media ON posts.post_id = media.post_id
JOIN 
    user_information ON posts.user_id = user_information.user_id
JOIN
    users ON posts.user_id = users.user_id
LEFT JOIN 
    post_reaction ON posts.post_id = post_reaction.post_id
LEFT JOIN 
    post_comment ON posts.post_id = post_comment.post_id
WHERE 
    users.username = $2
GROUP BY
 	user_information.name, users.username, user_information.avatar_url, posts.post_id,
	posts.user_id, posts.visibility, posts.text, posts.created_at;`,
    [userId, userName],
  );
};

post.reactionPost = async (postId, userId, reaction) => {
  // Check if the user has already reacted to the post
  const existingReaction = await db.query(
    `SELECT * FROM post_reaction WHERE post_id = $1 AND user_id = $2`,
    [postId, userId],
  );

  if (reaction === null) {
    await db.query(
      `DELETE FROM post_reaction WHERE post_id = $1 AND user_id = $2`,
      [postId, userId],
    );
    return;
  }

  if (existingReaction.rows.length > 0) {
    // User has already reacted, update the existing reaction
    await db.query(
      `UPDATE post_reaction SET reaction = $1 WHERE post_id = $2 AND user_id = $3`,
      [reaction, postId, userId],
    );
  } else {
    // User has not reacted yet, insert a new reaction
    await db.query(
      `INSERT INTO post_reaction (post_id, user_id, reaction) VALUES ($1, $2, $3)`,
      [postId, userId, reaction],
    );
  }
};

export default post;
