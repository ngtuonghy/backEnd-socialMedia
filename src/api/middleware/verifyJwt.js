import "dotenv/config";
import jwt from "jsonwebtoken";
import { createAccessJwt } from "#src/utils/Jwt";
import env from "#src/config/env";
import { redisGet } from "#src/utils/redis";

async function refreshTokenFuc(sessionId, userId) {
	if (sessionId && userId) {
		try {
			const refreshToken = await redisGet(`${userId}:${sessionId}`);
			return new Promise((resolve, reject) => {
				jwt.verify(
					refreshToken,
					process.env.REFRESH_TOKEN_SECRET,
					(err, decoded) => {
						if (err) {
							// console.log("Error:", err);
							resolve(false);
						} else {
							// console.log("Refresh Token is running:", refreshToken);
							resolve(true);
						}
					},
				);
			});
		} catch (error) {
			console.error("Error:", error);
			return false;
		}
	} else {
		console.log("Missing sessionId or userId");
		return false;
	}
}

export default function verifyJwt(req, res, next) {
	// const token = req.headers.token;
	const cookies = req.cookies;
	const accessToken = cookies.accessToken;
	const sessionId = cookies.sessionId;
	const userId = cookies.userId;
	try {
		if (
			userId === undefined ||
			sessionId === undefined ||
			accessToken === undefined
		) {
			res.clearCookie("accessToken");
			res.clearCookie("sessionId");
			return res.status(401).json({ message: "You are not authenticated" });
		}
		// console.log(userId);
		jwt.verify(accessToken, env.jwt.accessSecret, async (err, decoded) => {
			// console.log(env.jwt.accessSecret);
			if (err) {
				const checkRefreshToken = await refreshTokenFuc(sessionId, userId);
				if (checkRefreshToken) {
					const accessToken = createAccessJwt(userId);
					res.cookie("accessToken", accessToken, {
						httpOnly: true,
						secure: false,
						path: "/",
						samSite: "strict",
					});
					// console.log("true");
					return next();
				} else {
					// console.log("false");
					res.clearCookie("accessToken");
					res.clearCookie("userId");
					res.clearCookie("sessionId");
					return res.status(403).json({
						message: "Token is not valid",
					});
				}
			}
			// console.log("accessToken Token is running:");
			return next();
		});
	} catch (err) {
		return res.status(403).json({
			code: 403,
			message: "Some thing went wrong",
		});
	}
}
