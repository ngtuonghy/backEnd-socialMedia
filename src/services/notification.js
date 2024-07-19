import notification from "#src/models/notification";

export async function createNotification(req, res) {
	const userId = req.cookies.userId;
	const {
		notificationId,
		createdByUserId,
		notificationType,
		notificationUrl,
		notificationData,
	} = req.body;
	try {
		await notification.createNotification(
			notificationId,
			userId,
			createdByUserId,
			notificationType,
			notificationUrl,
			notificationData,
		);
		res.status(200).json({
			code: 200,
			message: "success",
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			code: 500,
			message: `error: ${error}`,
		});
	}
}
export async function deleteNotification(req, res) {
	const { notificationId } = req.params;
	try {
		await notification.deleteNotification(notificationId);
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
export async function getNotification(req, res) {
	const { userId } = req.params;
	const isReaded = req.query.isReaded === "true";
	const limit = parseInt(req.query.limit, 10) || 10;
	const offset = parseInt(req.query.offset, 10) || 0;
	// console.log(isReaded, limit, offset);
	try {
		const result = await notification.getNotification(
			userId,
			isReaded,
			limit,
			offset,
		);
		res.status(200).json({
			code: 200,
			data: result.rows,
			message: "success",
		});
	} catch (error) {
		res.status(500).json({
			code: 500,
			message: `error: ${error}`,
		});
	}
}

export async function updateNotification(req, res) {
	const { notificationId } = req.params;
	try {
		await notification.updateNotification(notificationId);
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
