import * as db from "./../../../utils/utilPg.js";

const auth = {};

// CREATE ARTICLE
auth.getUser = async (username) => {
	return await db.query("SELECT * FROM users WHERE username = $1", [username]);
};
auth.getEmail = async (email) => {
	return await db.query("SELECT * FROM users WHERE email = $1", [email]);
};
auth.getUserbyId = async (userId) => {
	return await db.query("SELECT * FROM users WHERE user_id = $1", [userId]);
};

// GET ALL ARTICLES
auth.createUser = async (
	userId,
	accountType,
	username,
	hashedPassword,
	email,
	verifiedEmail,
	avatarUrl,
	phone,
	name,
	dayOfBirth,
	sex,
) => {
	try {
		await db.query(
			`INSERT INTO users (user_id, account_type, username, password, email, verified_email) VALUES ($1,$2,$3,$4,$5,$6)`,
			[userId, accountType, username, hashedPassword, email, verifiedEmail],
		);
		await db.query(
			`INSERT INTO profiles (user_id, avatar_url, phone, name, day_of_birth, sex) VALUES ($1,$2,$3,$4,$5,$6)`,
			[userId, avatarUrl, phone, name, dayOfBirth, sex],
		);
		// console.log("User created successfully.");
	} catch (error) {
		throw new Error(error); // Ném lỗi ra ngoài
	}
};

// DELETE AN ARTICLE
auth.delete = (id) => {
	return db.query(`DELETE from articles WHERE id = $1`, [id]);
};

export default auth;
