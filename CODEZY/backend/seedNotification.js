import mongoose from "mongoose";
import dotenv from "dotenv";
import Notification from "./models/Notification.js";
import NotificationRecipient from "./models/NotificationRecipient.js";
import User from "./models/User.js";

dotenv.config();

// Replace with actual user ID and tenant ID from your DB
const TEST_USER_ID = "698311e87804eccd6cb1716f";
const TENANT_ID = "698311e87804eccd6cb1716d";

const run = async () => {
  try {
    // 1️⃣ Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("MongoDB connected");

    // 2️⃣ Create a notification
    const notification = await Notification.create({
      title: "Welcome to Codezy!",
      message: "This is a test notification for your account.",
      type: "SYSTEM",
      createdBy: null, // system-generated
      tenantId: TENANT_ID
    });

    console.log("Notification created:", notification);

    // 3️⃣ Create NotificationRecipient
    const recipient = await NotificationRecipient.create({
      notification: notification._id,
      user: TEST_USER_ID,
      tenantId: notification.tenantId,
      isRead: false
    });

    console.log("NotificationRecipient created:", recipient);

    // Done
    console.log("✅ Test notification seeded successfully");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding notification:", err);
    process.exit(1);
  }
};

run();
