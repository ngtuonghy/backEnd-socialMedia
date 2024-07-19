import vote from "#src/models/vote";

export async function getVote(req, res) {
	const { postId } = req.params;

	if (postId === null) {
		return res.status(400).json({
			code: 400,
			message: "Bad Request: postId and userId are required.",
		});
	}

	try {
		const result = await vote.getVotePost(postId);
		res.status(200).json({
			code: 200,
			message: "success",
			data: result.rows[0],
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			code: 500,
			message: "error",
		});
	}
}

export async function updateVote(req, res) {
	const { vote_state } = req.body;
	const { postId, userId } = req.params;
	if (postId === null || userId === null) {
		return res.status(400).json({
			code: "400",
			message: "Bad Request: postId and userId are required.",
		});
	}

	try {
		if (vote_state === null) {
			await vote.deleteVotePost(postId, userId);
			return res.status(200).json({
				code: 200,
				message: "success",
			});
		}
		await vote.updateVotePost(postId, userId, vote_state);
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
