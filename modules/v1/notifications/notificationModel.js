import * as db from "./../../../utils/utilPg.js";
const notification = {};

notification.createNotification = async (
  notificationId,
  userId,
  createdByUserId,
  text,
  url,
  urlType,
) => {
  await db.query(
    `INSERT INTO notification (notification_id, user_id, created_by_user_id, text, url, url_type) VALUES ($1, $2, $3, $4, $5, $6)`,
    [notificationId, userId, createdByUserId, text, url, urlType],
  );
};

notification.getNotification = async (userId, isReaded, limit, offset) => {
  // Create the base query with parameter placeholders
  let query = `
    SELECT 
      notification.notification_id,
      user_information.avatar_url,
      user_information.name,
      notification.text,
      notification.url,
      notification.url_type,
      notification.readed,
      notification.created_at
    FROM
      notification
    JOIN 
      user_information ON notification.created_by_user_id = user_information.user_id
    JOIN 
      users ON notification.created_by_user_id = users.user_id
    WHERE 
      notification.user_id = $1
  `;

  // Conditionally add the `isReaded` filter
  if (isReaded === false) {
    query += ` AND notification.readed = false`;
  }

  // Add ordering, limit, and offset
  query += `
    ORDER BY 
      notification.created_at DESC
    LIMIT $2
    OFFSET $3
  `;

  // Execute the query with the provided parameters
  return await db.query(query, [userId, limit, offset]);
};

notification.deleteNotification = async (notificationId) => {
  await db.query(`DELETE FROM notification WHERE notification_id = $1`, [
    notificationId,
  ]);
};
notification.updateNotification = async (notificationId) => {
  await db.query(
    `UPDATE notification SET readed = true WHERE notification_id = $1`,
    [notificationId],
  );
};
export default notification;
