import user from "./userModel.js";
import bcrypt from "bcrypt";
import { signatureCloudinary } from "../../../utils/utilCloudnary.js";
export async function getProfileUser(req, res) {
	const { userIdentifier } = req.query;
	const { identifier } = req.params;
	// console.log(identifier);
	try {
		let userObject;
		if (userIdentifier === "username") {
			userObject = await user.getUser(identifier);
		} else {
			userObject = await user.getUserbyId(identifier);
		}
		const { rows } = userObject;
		if (rows.length === 0) {
			return res.status(404).json({
				code: 404,
				message: "User not found",
			});
		}

		// Remove the password field from the user object
		const userProfile = { ...rows[0] };
		delete userProfile.password;

		return res.status(200).json({
			code: 200,
			message: "success",
			data: {
				user: userProfile,
			},
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			message: error.message,
		});
	}
}
export async function signCloudinary(req, res) {
	const cookies = req.cookies;
	// const userId = cookies.userId;
	const { upload_preset, publicId } = req.body;
	try {
		const sign = await signatureCloudinary(publicId, upload_preset);
		console.log(sign);
		return res.status(200).json({
			code: 200,
			message: "success",
			sign,
		});
	} catch (error) {
		return res.status(500).json({
			message: error.message,
		});
	}
}

export async function updateProfile(req, res) {
	const {
		username,
		password,
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
	} = req.body;
	const userId = req.cookies.userId;
	// console.log(req.body);
	try {
		let hashedPassword = undefined;
		if (password) {
			hashedPassword = await bcrypt.hash(password, 10);
		}
		await user.update(
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
		);
		return res.status(200).json({
			code: 200,
			message: "success",
		});
	} catch (error) {
		return res.status(500).json({
			message: error.message,
		});
	}
}
