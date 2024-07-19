import * as db from "#src/utils/pg";
const post = {};

post.getAllPost = async (userId, limit, offset, username) => {
	let query = `SELECT
    users.username,
    profiles.avatar_url,
    profiles.name,
    p.post_id,
    p.user_id,
    p.privacy,
    p.content,
    (
        SELECT 
            json_agg(json_build_object('media_url', m.media_url, 'media_type', m.media_type))
        FROM 
            media m 
        WHERE 
            m.post_id = p.post_id
    ) AS media_urls,
    MAX(CASE WHEN v.user_id = $1 THEN v.vote_state ELSE NULL END) AS user_vote, 
    COUNT(DISTINCT c.comment_id) AS comment_count,
    COUNT(DISTINCT v.vote_id) AS vote_count,
    p.created_at
FROM 
    posts p
LEFT JOIN
    media m ON p.post_id = m.post_id
LEFT JOIN 
    votes v ON p.post_id = v.post_id
LEFT JOIN 
    comments c ON p.post_id = c.post_id
JOIN 
    profiles ON profiles.user_id = p.user_id
JOIN
    users ON users.user_id = p.user_id
WHERE`;

	if (username) {
		query += ` users.username = '${username}'`;
	} else {
		query += ` p.privacy = 'public'`;
	}
	query += ` 
  GROUP BY  
    p.post_id, users.username, profiles.avatar_url, profiles.name, p.privacy, p.content, p.created_at
  ORDER BY 
    p.created_at DESC
LIMIT ${limit}
OFFSET ${offset};`;
	return await db.query(query, [userId]);
	// 	return await db.query(
	// 		`SELECT
	//     users.username,
	//     profiles.avatar_url,
	//     profiles.name,
	//     p.post_id,
	//     p.user_id,
	//     p.privacy,
	//     p.content,
	//     (
	//         SELECT
	//             json_agg(json_build_object('media_url', m.media_url, 'media_type', m.media_type))
	//         FROM
	//             media m
	//         WHERE
	//             m.post_id = p.post_id
	//     ) AS media_urls,
	//     MAX(CASE WHEN v.user_id = $1 THEN v.vote_state ELSE NULL END) AS user_vote,
	//     COUNT(DISTINCT c.comment_id) AS comment_count,
	//     COUNT(DISTINCT v.vote_id) AS vote_count,
	//     p.created_at
	// FROM
	//     posts p
	// LEFT JOIN
	//     media m ON p.post_id = m.post_id
	// LEFT JOIN
	//     votes v ON p.post_id = v.post_id
	// LEFT JOIN
	//     comments c ON p.post_id = c.post_id
	// JOIN
	//     profiles ON profiles.user_id = p.user_id
	// JOIN
	//     users ON users.user_id = p.user_id
	// WHERE
	//     p.privacy = 'public'
	// GROUP BY
	//     p.post_id, users.username, profiles.avatar_url, profiles.name, p.privacy, p.content, p.created_at
	// ORDER BY
	//     p.created_at DESC
	// LIMIT ${limit}
	// OFFSET ${offset};`,
	// 		[userId],
	// 	);
};

post.createPost = async (postId, userId, privacy, content) => {
	return await db.query(
		`INSERT INTO posts (post_id, user_id, content, privacy) VALUES ($1,$2,$3,$4) RETURNING *;`,
		[postId, userId, content, privacy],
	);
};

post.createMedia = async (userId, postId, mediaType, mediaUrl) => {
	await db.query(
		`INSERT INTO media (user_id, media_type, media_url, post_id) VALUES ($1,$2,$3,$4) RETURNING media_id;`,
		[userId, mediaType, mediaUrl, postId],
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

export default post;
