import NotificationRecipient from "../models/NotificationRecipient.js";

export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;  
    const tenantId = req.user.tenantId;

    if (!userId) return res.status(400).json({ message: "User not found" });

    const notifications = await NotificationRecipient.find({
      user: userId,
      tenantId: tenantId
    })
      .populate("notification")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    console.error("FETCH NOTIFICATIONS ERROR:", err);
    res.status(500).json({ message: "Server error fetching notifications" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const notificationId = req.params.id;

    const recipient = await NotificationRecipient.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true },
      { new: true }
    );

    if (!recipient) return res.status(404).json({ message: "Notification not found" });

    res.json({ message: "Notification marked as read", recipient });
  } catch (err) {
    console.error("MARK AS READ ERROR:", err);
    res.status(500).json({ message: "Server error marking notification as read" });
  }
};
