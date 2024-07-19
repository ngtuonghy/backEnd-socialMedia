import * as db from "#src/utils/pg";
const vote = {};

vote.getVotePost = async (postId) => {
	return await db.query(
		`SELECT 
   SUM(CASE 
     WHEN
	 vote_state = 'up' THEN 1 
     	WHEN vote_state = 'down' THEN -1 
     		ELSE 0 
     	END) AS vote_count
    FROM 
        votes
    WHERE post_id = $1;`,
		[postId],
	);
};
vote.updateVotePost = async (postId, userId, vote_state) => {
	// Check if the user has already reacted to the post
	const existingReaction = await db.query(
		`SELECT * FROM votes WHERE post_id = $1 AND user_id = $2`,
		[postId, userId],
	);

	if (existingReaction.rows.length > 0) {
		// User has already reacted, update the existing reaction
		await db.query(
			`UPDATE votes SET vote_state = $1 WHERE post_id = $2 AND user_id = $3`,
			[vote_state, postId, userId],
		);
	} else {
		// User has not reacted yet, insert a new reaction
		await db.query(
			`INSERT INTO votes (post_id, user_id, vote_state) VALUES ($1, $2, $3)`,
			[postId, userId, vote_state],
		);
	}
};

vote.deleteVotePost = async (postId, userId) => {
	await db.query(`DELETE FROM votes WHERE post_id = $1 AND user_id = $2`, [
		postId,
		userId,
	]);
};

export default vote;
