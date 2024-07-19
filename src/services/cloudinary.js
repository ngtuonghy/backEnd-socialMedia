import { signatureCloudinary } from "#src/utils/cloudnary";

export async function signCloudinary(req, res) {
	const { upload_preset, public_id } = req.body;
	try {
		const sign = await signatureCloudinary(public_id, upload_preset);
		return res.status(200).json({
			code: 200,
			message: "success",
			data: {
				sign,
			},
		});
	} catch (error) {
		return res.status(500).json({
			message: error.message,
		});
	}
}
export async function test(req, res) {
	console.log(req.body);
	try {
		res.status(200).json({
			code: 200,
			message: "success",
			data: req.body,
		});
	} catch (error) {}
}
