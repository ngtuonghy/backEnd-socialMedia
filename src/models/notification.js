import * as db from "#src/utils/pg";
const notification = {};

notification.createNotification = async (
	userId,
	createdByUserId,
	notificationType,
	notificationUrl,
	notificationData,
) => {
	return await db.query(
		`INSERT INTO notifications (user_id, created_by_user_id, notification_type, notification_url, notification_data) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
		[
			userId,
			createdByUserId,
			notificationType,
			notificationUrl,
			notificationData,
		],
	);
};

notification.getNotification = async (userId, isReaded, limit, offset) => {
	// Create the base query with parameter placeholders
	let query = `
    SELECT 
      notifications.*,
      profiles.avatar_url,
      profiles.name
    FROM
      notifications
    JOIN 
     profiles ON notifications.created_by_user_id = profiles.user_id
    WHERE 
      notifications.user_id = $1
  `;

	// Conditionally add the `isReaded` filter
	if (isReaded === false) {
		query += ` AND notifications.is_readed = false`;
	}

	// Add ordering, limit, and offset
	query += `
    ORDER BY 
      notifications.created_at DESC
    LIMIT $2
    OFFSET $3
  `;
	// Execute the query with the provided parameters
	return await db.query(query, [userId, limit, offset]);
};

notification.deleteNotification = async (notificationId) => {
	await db.query(`DELETE FROM notifications WHERE notification_id = $1`, [
		notificationId,
	]);
};
notification.updateNotification = async (notificationId) => {
	await db.query(
		`UPDATE notifications SET is_readed = true WHERE notification_id = $1`,
		[notificationId],
	);
};
export default notification;
