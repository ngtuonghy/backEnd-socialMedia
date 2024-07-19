import * as db from "#src/utils/pg";

const user = {};

// CREATE ARTICLE
user.getUser = async (username) => {
	return await db.query(
		"SELECT * FROM users JOIN profiles ON users.user_id = profiles.user_id WHERE users.username = $1",
		[username],
	);
};
user.getEmail = async (email) => {
	return await db.query("SELECT * FROM users WHERE email = $1", [email]);
};
user.getUserbyId = async (userId) => {
	return await db.query(
		"SELECT * FROM users JOIN profiles ON users.user_id = profiles.user_id WHERE users.user_id = $1",
		[userId],
	);
};

user.update = async (
	username,
	hashedPassword,
	email,
	verifiedEmail,
	bio,
	avatarUrl,
	coverImgUrl,
	name,
	dayOfBirth,
	sex,
	location,
	website,
	userId,
) => {
	const updateConditions = [];
	const updateValues = [];

	if (username !== undefined) {
		updateConditions.push("username = $" + (updateValues.length + 1));
		updateValues.push(username);
	}
	if (hashedPassword !== undefined) {
		updateConditions.push("password = $" + (updateValues.length + 1));
		updateValues.push(hashedPassword);
	}
	if (email !== undefined) {
		updateConditions.push("email = $" + (updateValues.length + 1));
		updateValues.push(email);
	}
	if (verifiedEmail !== undefined) {
		updateConditions.push("verified_email = $" + (updateValues.length + 1));
		updateValues.push(verifiedEmail);
	}

	const updateConditionsT = [];
	const updateValuesT = [];

	if (bio !== undefined) {
		updateConditionsT.push("bio = $" + (updateValuesT.length + 1));
		updateValuesT.push(bio);
	}

	if (avatarUrl !== undefined) {
		updateConditionsT.push("avatar_url = $" + (updateValuesT.length + 1));
		updateValuesT.push(avatarUrl);
	}

	if (coverImgUrl !== undefined) {
		updateConditionsT.push("cover_image_url = $" + (updateValuesT.length + 1));
		updateValuesT.push(coverImgUrl);
	}

	if (name !== undefined) {
		updateConditionsT.push("name = $" + (updateValuesT.length + 1));
		updateValuesT.push(name);
	}

	if (dayOfBirth !== undefined) {
		updateConditionsT.push("day_of_birth = $" + (updateValuesT.length + 1));
		updateValuesT.push(dayOfBirth);
	}
	if (sex !== undefined) {
		updateConditionsT.push("sex = $" + (updateValuesT.length + 1));
		updateValuesT.push(sex);
	}
	if (location !== undefined) {
		updateConditionsT.push("location = $" + (updateValuesT.length + 1));
		updateValuesT.push(location);
	}
	if (website !== undefined) {
		updateConditionsT.push("website = $" + (updateValuesT.length + 1));
		updateValuesT.push(website);
	}
	if (updateConditions.length === 0 && updateConditionsT.length === 0) {
		return;
	}
	if (updateConditions.length > 0) {
		const updateQuery = `
    UPDATE users
    SET ${updateConditions.join(", ")}
    WHERE user_id = $${updateValues.length + 1}
  `;
		await db.query(updateQuery, [...updateValues, userId]);
	}
	// console.log(updateConditionsT);
	if (updateConditionsT.length > 0) {
		const updateQueryT = `
    UPDATE profiles
    SET ${updateConditionsT.join(", ")}
    WHERE user_id = $${updateValuesT.length + 1}
  `;
		await db.query(updateQueryT, [...updateValuesT, userId]);
	}
};
// DELETE AN ARTICLE
user.delete = (id) => {
	return db.query(`DELETE from articles WHERE id = $1`, [id]);
};

export default user;
