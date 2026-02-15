import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
    required: true,
    index: true
  },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rollNumber: { type: String, required: true },
  xp: { type: Number, default: 0 },
  role: { type: String, default: 'student' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  classId: { type: mongoose.Schema.Types.ObjectId },
  mfaEnabled: { type: Boolean, default: false },
  mfaSecret: { type: String, default: null },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, { timestamps: true });
studentSchema.index({ tenantId: 1, email: 1 }, { unique: true });

const Student = mongoose.model('Student', studentSchema);
export default Student;