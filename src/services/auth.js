import bcrypt from "bcrypt";
import env from "#src/config/env";

import createSesionLogin, {
	getGihubUser,
	getGithubOauthToken,
	getGoogleOauthToken,
	getGoogleUser,
} from "#src/helpers/auth";

import { redisDel, redisGet, redisSet } from "#src/utils/redis";
import querystring from "querystring";
import { generatePublicId } from "#src/utils/createNanoId";
import { sendEmail } from "./email.js";
import { createAccessJwt, createRefreshJwt } from "#src/utils/Jwt";
import auth from "#src/models/auth";

export async function register(req, res) {
	const {
		username,
		password,
		email,
		name,
		dayOfBirth,
		verifiedEmail,
		phone,
		sex,
	} = req.body;
	console.log(username);
	try {
		const { rows } = await auth.getUser(username);
		// console.log(rows);
		if (rows.length) throw new Error("Username already exists");
		const userId = generatePublicId(15);
		if (username && password) {
			const avatarUrl = `https://res.cloudinary.com/dnayoefgw/image/upload/v1713328882/profile/default1.png`;
			const hashedPassword = await bcrypt.hash(password, 10);

			await auth.createUser(
				userId,
				"user",
				username,
				hashedPassword,
				email,
				verifiedEmail,
				avatarUrl,
				phone,
				name,
				dayOfBirth,
				sex,
			);
			res.status(200).json({
				code: 200,
				message: "success",
			});
		} else {
			throw new Error("Field null");
		}
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			message: error.message,
		});
	}
}

export async function login(req, res) {
	const { username, password } = req.body;
	try {
		const { rows } = await auth.getUser(username);
		if (!rows.length)
			return res.status(404).json({ message: "This username does not exist." });
		const valid = await bcrypt.compare(password, rows[0].password);
		if (!valid)
			return res
				.status(400)
				.json({ message: "That password was incorrect. Please try again." });

		const userId = rows[0].user_id;
		const accessToken = createAccessJwt(userId);
		const refreshToken = createRefreshJwt(userId);
		const sessionId = generatePublicId(10);

		await createSesionLogin(res, userId, sessionId, accessToken, refreshToken);

		res.status(200).json({
			code: 200,
			message: "success",
		});
	} catch (error) {
		console.log(error.message);
		return res.status(500).json({
			message: "Something went wrong.",
		});
	}
}

export const logout = async (req, res) => {
	const cookies = req.cookies;
	const sessionId = cookies.sessionId;
	const userId = cookies.userId;
	try {
		await redisDel(`${userId}:${sessionId}`);
		res.clearCookie("userId");
		res.status(200).json({
			message: "success",
		});
	} catch (error) {
		console.log(error);
	}
};

export const oauthGoogle = async (req, res) => {
	const code = req.query.code;
	if (!code) return res.redirect(`${process.env.WEB_ENDPOINT}`);
	try {
		const { id_token, access_token } = await getGoogleOauthToken({ code });
		// console.log({ id_token, access_token });
		const googleUser = await getGoogleUser({ id_token, access_token });
		// console.log(googleUser);
		const accessToken = createAccessJwt(googleUser.id);
		const refreshToken = createRefreshJwt(googleUser.id);
		const sessionId = generatePublicId(10);

		const { rows } = await auth.getUserbyId(googleUser.id);

		if (!rows.length) {
			await auth.createUser(
				googleUser.id,
				"google",
				googleUser.id,
				null,
				null,
				null,
				googleUser.picture,
				null,
				googleUser.name,
				null,
				null,
			);
		}
		await createSesionLogin(
			res,
			googleUser.id,
			sessionId,
			accessToken,
			refreshToken,
		);
		// console.log("googleUser", googleUser);
		return res.redirect(`${env.APP_URL}/home`);
	} catch (error) {
		return res.redirect(`${env.APP_URL}/oauth/error`);
		// log.error(error, "Failed to authorize Google user");
	}
};

export const oauthGithub = async (req, res) => {
	const code = req.query.code;
	try {
		const { access_token } = await getGithubOauthToken({ code });
		// console.log({ access_token });
		const user = await getGihubUser({ access_token });
		// console.log(user);
		const accessToken = createAccessJwt(user.id);
		const refreshToken = createRefreshJwt(user.id);
		const sessionId = generatePublicId(10);
		const { rows } = await auth.getUserbyId(user.id);

		if (!rows.length) {
			await auth.createUser(
				user.id,
				"github",
				user.id,
				null,
				user.email,
				null,
				user.avatar_url,
				null,
				user.name,
				null,
				null,
			);
		}
		await createSesionLogin(res, user.id, sessionId, accessToken, refreshToken);
		return res.redirect(`${env.APP_URL}/home`);
	} catch (error) {
		// log.error(error, "Failed to authorize Github user");
		return res.redirect(`${env.APP_URL}/oauth/error`);
	}
};

export async function newUserCheck(req, res) {
	const { username } = req.body;
	try {
		const { rows } = await auth.getUser(username);
		// console.log(rows);
		if (rows.length)
			return res.status(200).json({
				status: "user_exists",
				message: "This username is unavailable.",
			});
		return res.status(200).json({
			message: "success",
		});
	} catch (error) {
		return res.status(500).json({
			message: error.message,
		});
	}
}
export async function checkUser(req, res) {
	const username = req.params.username;
	try {
		const { rows } = await auth.getUser(username);
		// console.log(rows);
		if (rows.length)
			return res.status(200).json({
				code: 409,
				message: "* This username is unavailable.",
			});
		return res.status(200).json({
			code: 200,
			message: "success",
		});
	} catch (error) {
		return res.status(500).json({
			code: 500,
			message: error.message,
		});
	}
}

export async function generateOtp(req, res) {
	const userId = req.cookies.userId;

	try {
		const { rows } = await auth.getUserbyId(userId);
		const email = rows[0].email;
		const otp = generatePublicId(6);
		await redisSet(`otp:${email}`, otp, {
			EX: 300,
			NX: false,
		});
		const data = {
			user_id: userId,
			verify_code: otp,
		};

		const searchParams = querystring.stringify(data);
		// console.log(searchParams);

		const mailOptions = {
			from: "youremail@gmail.com",
			to: "myfriend@yahoo.com",
			subject: "Sending Email using Node.js",
			html: `
<div> <h1>Your OTP is ${otp} </h1>
<p>Click <a href="${env.appApi}/verify-otp?${searchParams}">here</a> to verify your email</p>
</div>`,
		};

		sendEmail(mailOptions)
			.then((info) => {
				console.log("Email sent: " + info.response);
				// Xử lý tiếp theo nếu cần
			})
			.catch((error) => {
				console.log(error);
				// Xử lý lỗi nếu cần
			});
		return res.status(200).json({
			message: "success",
			email,
		});
	} catch (error) {
		return res.status(500).json({
			message: error.message,
		});
	}
}

export async function verifyOtp(req, res) {
	const { otp, userId } = req.body;
	console.log("otp", otp);
	try {
		const { rows } = await auth.getUserbyId(userId);
		const email = rows[0].email;
		const data = await redisGet(`otp:${email}`);
		// console.log("data", data);
		if (data === otp) {
			return res.status(200).json({
				message: "Verification successful.",
			});
		}
		return res.status(422).json({
			message:
				"Verification failed because the code did not match or has expired.",
		});
	} catch (error) {
		return res.status(500).json({
			message: error.message,
		});
	}
}
export async function update(req, res) {
	const {
		username,
		password,
		email,
		verifiedEmail,
		avatarUrl,
		name,
		dayOfBirth,
		sex,
	} = req.body;
	const userId = req.cookies.userId;
	try {
		let hashedPassword = undefined;
		if (password) {
			hashedPassword = await bcrypt.hash(password, 10);
		}
		// console.log(req.body);
		await auth.update(
			username,
			hashedPassword,
			email,
			verifiedEmail,
			avatarUrl,
			name,
			dayOfBirth,
			sex,
			userId,
		);
		res.status(200).json({
			message: "success",
		});
	} catch (error) {
		console.log(error.message);
		return res.status(500).json({
			message: "Something went wrong.",
		});
	}
}
