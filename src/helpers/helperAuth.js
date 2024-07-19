import qs from "querystring";
import axios from "axios";
import { redisSet } from "../utils/utilRedis.js";
export const getGoogleOauthToken = async ({ code }) => {
	const rootURl = "https://oauth2.googleapis.com/token";
	const options = {
		code,
		client_id: process.env.GOOGLE_CLIENT_ID,
		client_secret: process.env.GOOGLE_CLIENT_SECRET,
		redirect_uri: process.env.GOOGLE_OAUTH_CALLBACK_URL,
		grant_type: "authorization_code",
	};
	try {
		// console.log(data);
		const { data } = await axios.post(rootURl, qs.stringify(options), {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		});
		return data;
	} catch (err) {
		console.log("Failed to fetch goggle  Oauth Tokens");
		// throw new Error(err);
	}
};
export async function getGoogleUser({ id_token, access_token }) {
	try {
		const { data } = await axios(
			`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
			{
				headers: {
					Authorization: `Bearer ${id_token}`,
				},
			},
		);

		return data;
	} catch (err) {
		console.log(err);
		throw Error(err);
	}
}

export const getGithubOauthToken = async ({ code }) => {
	const rootURl = "https://github.com/login/oauth/access_token";
	const options = {
		client_id: process.env.GITHUB_CLIENT_ID,
		client_secret: process.env.GITHUB_CLIENT_SECRET,
		code,
		redirect_uri: process.env.GITHUB_OAUTH_CALLBACK_URL,
	};
	try {
		const { data } = await axios.post(rootURl, qs.stringify(options));
		const decoded = qs.parse(data);
		return decoded;
		// console.log("data github token: " + data);
	} catch (err) {
		// console.log(err, "Failed to fetch Google Oauth Tokens");
		// throw new Error(err);
	}
};
export async function getGihubUser({ access_token }) {
	try {
		const { data } = await axios(`https://api.github.com/user`, {
			headers: {
				Authorization: `Bearer ${access_token}`,
			},
		});
		return data;
	} catch (err) {
		console.log(err);
		// throw Error(err);
	}
}
export default async function createSesionLogin(
	res,
	userId,
	sessionId,
	accessToken,
	refreshToken,
) {
	await redisSet(`${userId}:${sessionId}`, refreshToken, {
		EX: 365 * 24 * 60 * 60,
		NX: true,
	});

	res.cookie("accessToken", accessToken, {
		httpOnly: true,
		secure: false,
		path: "/",
		samSite: "strict",
	});
	res.cookie("sessionId", sessionId, {
		httpOnly: true,
		secure: false,
		path: "/",
		samSite: "strict",
	});
	res.cookie("userId", userId, {
		httpOnly: false,
		secure: false,
		path: "/",
		samSite: "strict",
	});
}
