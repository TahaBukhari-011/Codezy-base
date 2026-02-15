import Notification from "../models/Notification.js";
import NotificationRecipient from "../models/NotificationRecipient.js";
import Student from "../models/Students.js";
import Teacher from "../models/Teacher.js";

/**
 * Create notification for individual users and/or entire roles
 */
export const createNotification = async ({
  title,
  message,
  type,
  createdBy,
  recipientIds = [],
  role = null,
  tenantId
}) => {
  if (!tenantId) tenantId = "GLOBAL";

  // Fetch users by role
  let roleUsers = [];
  if (role === "student") {
    roleUsers = await Student.find({ tenantId }).select("_id").lean();
  } else if (role === "teacher") {
    roleUsers = await Teacher.find({ tenantId }).select("_id").lean();
  }

  const allRecipients = [
    ...roleUsers.map(u => u._id.toString()),
    ...recipientIds
  ];

  const uniqueRecipients = [...new Set(allRecipients)];

  if (uniqueRecipients.length === 0) {
    console.warn("No recipients for notification:", title);
    return null;
  }

  const notification = await Notification.create({
    title,
    message,
    type,
    createdBy,
    tenantId
  });

  const recipientDocs = uniqueRecipients.map(userId => ({
    notification: notification._id,
    user: userId,
    tenantId
  }));

  await NotificationRecipient.insertMany(recipientDocs);

  return notification;
};
