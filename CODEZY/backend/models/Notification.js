import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    tenantId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Tenant", 
      required: true 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "LAB_CREATED",
        "EXAM_CREATED",
        "ANNOUNCEMENT",
        "SYSTEM"
      ],
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
