import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
    required: true,
    index: true
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  progress: { type: Number, default: 0 }, // Percent 0-100
  currentModule: { type: String, default: "Introduction" },
  enrolledAt: { type: Date, default: Date.now }
});

export default mongoose.model("Enrollment", enrollmentSchema);