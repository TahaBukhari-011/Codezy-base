// src/components/Notifications.jsx
import { useEffect, useState } from "react";
import { fetchNotifications, markNotificationRead } from "../services/notificationApi";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Detect logged-in user role from localStorage
  const userRole = localStorage.getItem("role") || "individual_learner";
  const userId = localStorage.getItem("userId") || null;

  useEffect(() => {
    const getNotifications = async () => {
      try {
        // Pass userId and role to backend for role-based notifications
        const res = await fetchNotifications(userId, userRole);

        // Sort newest first
        const sorted = res.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNotifications(sorted);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
        setError("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    getNotifications();
  }, [userId, userRole]);

  const handleRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // Determine notification background color
  const getBackgroundColor = (n) => {
    if (n.isRead) return "#eee";
    switch (n.notification.type) {
      case "LAB_CREATED":
        return "#fef3c7"; // yellow
      case "EXAM_CREATED":
        return "#dbeafe"; // blue
      case "ANNOUNCEMENT":
        return "#e0f2f1"; // teal
      case "SYSTEM":
      default:
        return "#f0ebff"; // purple
    }
  };

  // Determine notification icon
  const getIcon = (n) => {
    switch (n.notification.type) {
      case "LAB_CREATED":
        return "🧪";
      case "EXAM_CREATED":
        return "📝";
      case "ANNOUNCEMENT":
        return "📢";
      case "SYSTEM":
      default:
        return "🔔";
    }
  };

  if (loading) return <p>Loading notifications...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Notifications</h2>

      {notifications.length === 0 && <p>No notifications yet</p>}

      {notifications.map((n) => (
        <div
          key={n._id}
          className="flex items-start gap-4 p-4 mb-3 rounded-lg"
          style={{ background: getBackgroundColor(n) }}
        >
          <span className="text-2xl">{getIcon(n)}</span>

          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 mb-1">
              {n.notification.title}
            </h4>
            <p className="text-gray-700 text-sm mb-1">{n.notification.message}</p>
            <small className="text-gray-500 text-xs">
              {new Date(n.createdAt).toLocaleString()}
            </small>
          </div>

          {!n.isRead && (
            <button
              onClick={() => handleRead(n._id)}
              className="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-md text-xs font-bold"
            >
              Mark as read
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
