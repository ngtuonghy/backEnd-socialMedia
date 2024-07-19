import * as db from "./../../../utils/utilPg.js";
const post = {};

post.getAllPost = async (userId, limit, offset) => {
	return await db.query(
		`SELECT
    users.username,
	  profiles.avatar_url,
  	profiles.name,
    p.post_id,
    p.privacy,
    p.content,
    (
    SELECT 
            json_agg(json_build_object('media_url', m.media_url, 'media_type', m.media_type))
    FROM 
            media m
		JOIN 
			post_media ON post_media.media_id = m.media_id
        WHERE 
           post_media.post_id  = p.post_id
    ) AS media_urls,
	   MAX(CASE WHEN r.user_id = $1 THEN r.reaction_type ELSE NULL END) AS user_reaction,
	  (
        SELECT json_agg(json_build_object(
            'reaction_type', rr.reaction_type,
            'user_id', rr.user_id
        ))
        FROM (
            SELECT r.reaction_type, r.user_id
            FROM reactions r
            WHERE r.post_id = p.post_id
            ORDER BY r.created_at DESC
            LIMIT 3
        ) AS rr
    ) AS top_reactions,
    COUNT(DISTINCT r.reaction_id) AS num_reactions,
    COUNT(DISTINCT c.comment_id) AS num_comments,
	p.created_at
FROM 
    posts p
LEFT JOIN
    post_media pm ON p.post_id = pm.post_id
LEFT JOIN 
    media m ON pm.media_id = m.media_id
LEFT JOIN 
    reactions r ON p.post_id = r.post_id
LEFT JOIN 
    comments c ON p.post_id = c.post_id
JOIN 
    profiles ON profiles.user_id = p.user_id
JOIN
    users ON users.user_id = p.user_id
WHERE 
    p.privacy IN ('public')
GROUP BY  
    p.post_id, users.username, profiles.avatar_url, profiles.name, p.privacy, p.content, p.created_at
ORDER BY 
    p.created_at DESC
LIMIT ${limit}
OFFSET ${offset};`,
		[userId],
	);
};

post.createPost = async (postId, userId, privacy, content) => {
	await db.query(
		`INSERT INTO posts (post_id, user_id, content, privacy) VALUES ($1,$2,$3,$4)`,
		[postId, userId, content, privacy],
	);
};

post.createMedia = async (userId, mediaId, postId, mediaType, mediaUrl) => {
	await db.query(
		`INSERT INTO media (media_id, user_id, media_type, media_url) VALUES ($1,$2,$3,$4)`,
		[mediaId, userId, mediaType, mediaUrl],
	);
	await db.query(
		`INSERT INTO post_media (post_id, media_id)
VALUES ($1, $2)`,
		[postId, mediaId],
	);
};

post.deletePost = async (postId) => {
	await db.query(`DELETE FROM posts WHERE post_id = $1`, [postId]);
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
            json_agg(json_build_object('media_url', m.media_id, 'media_type', m.media_type))
        FROM 
            media m
		JOIN 
			post_media ON post_media.media_id = m.media_id
        WHERE 
           post_media.post_id  = p.post_id
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

post.createReactions = async (postId, userId, reaction) => {
	// Check if the user has already reacted to the post
	const existingReaction = await db.query(
		`SELECT * FROM reactions WHERE post_id = $1 AND user_id = $2`,
		[postId, userId],
	);

	if (reaction === null) {
		await db.query(
			`DELETE FROM reactions WHERE post_id = $1 AND user_id = $2`,
			[postId, userId],
		);
		return;
	}

	if (existingReaction.rows.length > 0) {
		// User has already reacted, update the existing reaction
		await db.query(
			`UPDATE reactions SET reaction_type = $1 WHERE post_id = $2 AND user_id = $3`,
			[reaction, postId, userId],
		);
	} else {
		// User has not reacted yet, insert a new reaction
		await db.query(
			`INSERT INTO reactions (post_id, user_id, reaction_type) VALUES ($1, $2, $3)`,
			[postId, userId, reaction],
		);
	}
};

post.createComment = async (
	commentId,
	postId,
	userId,
	content,
	replyComment,
	mediaUrl,
	mediaType,
) => {
	await db.query(
		`INSERT INTO comments (comment_id, post_id, user_id, content, reply_to_comment_id, media_url, media_type) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		[commentId, postId, userId, content, replyComment, mediaUrl, mediaType],
	);
};

post.deleteComment = async (commentId, postId) => {
	await db.query(
		`DELETE FROM comments WHERE comment_id = $1 AND post_id = $2`,
		[commentId, postId],
	);
};

post.getReplyComment = async (commentId) => {
	return await db.query(
		`WITH ReplyCounts AS (
    SELECT 
        reply_to_comment_id,
        COUNT(*) AS reply_count
    FROM 
        comments
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
    comments AS post_comment
JOIN 
    profiles ON post_comment.user_id = profiles.user_id
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

post.getComment = async (postId, limit, offset, commentId) => {
	return await db.query(
		`WITH ReplyCounts AS (
    SELECT 
        reply_to_comment_id,
        COUNT(*) AS reply_count
    FROM 
        comments
    WHERE 
        reply_to_comment_id IS NOT NULL
    GROUP BY 
        reply_to_comment_id
)
SELECT 
    post_comment.comment_id,
    post_comment.user_id,
    post_comment.content,
    post_comment.media_url,
    post_comment.media_type,
    post_comment.post_id,
    post_comment.created_at,
    profiles.avatar_url,
    profiles.name,
    users.username,
    COALESCE(ReplyCounts.reply_count, 0) AS reply_count
FROM
    comments AS post_comment
JOIN 
    profiles ON post_comment.user_id = profiles.user_id
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
export default post;
