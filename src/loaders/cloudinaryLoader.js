import env from "#src/config/env";
import { v2 as cloudinary } from "cloudinary";

export function cloudinaryLoader() {
	cloudinary.config({
		cloud_name: env.uploadImage.cloudnaryName,
		api_key: env.uploadImage.cloudnaryApiKey,
		api_secret: env.uploadImage.cloudnaryApiSecret,
	});
}
