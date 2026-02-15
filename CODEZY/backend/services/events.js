// src/services/events.js
import { createNotification } from "./notificationService.js";

export const notifyEvent = async (eventType, payload, io) => {
  if (!io) return;

  switch (eventType) {

    // ================= LOGIN (EPHEMERAL ONLY) =================
    case "LOGIN": {
      io.to(`user-${payload.userId}`).emit("notification", {
        title: "Welcome to Codezy 👋",
        message: `Hello ${payload.fullName}, welcome back!`,
        type: "SYSTEM",
        persistent: false
      });
      break;
    }

    // ================= NEW LAB =================
    case "NEW_LAB": {
      const notif = await createNotification({
        title: "New Lab Uploaded",
        message: `Lab "${payload.labTitle}" is now available.`,
        type: "LAB_CREATED",
        createdBy: payload.teacherId,
        recipientIds: payload.studentIds,
        tenantId: payload.tenantId
      });

      // Students in class
      io.to(`students-${payload.classId}`).emit("notification", {
        ...notif.toObject(),
        persistent: true
      });

      // Teacher ephemeral confirmation
      io.to(`user-${payload.teacherId}`).emit("notification", {
        title: "Lab Created",
        message: `You created "${payload.labTitle}"`,
        persistent: false
      });

      break;
    }

    // ================= ANNOUNCEMENT =================
    case "GENERAL_ANNOUNCEMENT": {
      const studentNotif = await createNotification({
        title: payload.title,
        message: payload.message,
        type: "ANNOUNCEMENT",
        role: "student",
        tenantId: payload.tenantId
      });

      const teacherNotif = await createNotification({
        title: payload.title,
        message: payload.message,
        type: "ANNOUNCEMENT",
        role: "teacher",
        tenantId: payload.tenantId
      });

      io.to(`tenant-${payload.tenantId}-students`).emit("notification", {
        ...studentNotif.toObject(),
        persistent: true
      });

      io.to(`tenant-${payload.tenantId}-teachers`).emit("notification", {
        ...teacherNotif.toObject(),
        persistent: true
      });

      break;
    }

    default:
      console.warn("Unknown event:", eventType);
  }
};
