// routes/learner.js
import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

const router = express.Router();

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&()[\]{}#^<>.,;:'"~`+=_-]).{8,}$/;


// PUT Update Profile
router.put("/profile/:userId", async (req, res) => {
  try {
    const { fullName, email, bio } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: { fullName, email, bio } },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("Update DB Error:", err);
    res.status(500).json({ message: "Error saving to database" });
  }
});

// GET Profile Data
router.get("/profile/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile" });
  }
});

/* ======================================================
   DASHBOARD DATA
====================================================== */

router.get("/dashboard-data/:userId", async (req, res) => {
  try {
    const enrolled = await Enrollment.find({
      studentId: req.params.userId
    }).populate("courseId");

    const recommended = await Course.find({}).limit(4);

    const stats = {
      totalXp: 3250,
      completedLabs: 42,
      learningStreak: 12,
      xpThisWeek: 280
    };

    res.json({ enrolled, recommended, stats });
  } catch (err) {
    res.status(500).json({ message: "Error loading dashboard" });
  }
});

/* ======================================================
   ACCOUNT SECURITY
====================================================== */

// CHANGE PASSWORD (WITH STRONG VALIDATION)
// PUT Change Password
router.put("/change-password/:userId", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Strong password regex
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&()[\]{}#^<>.,;:'"~`+=_-]).{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
      });
    }

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return res.status(400).json({ message: "New password must be different" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ✅ IMPORTANT FIX (NO FULL VALIDATION)
    await User.updateOne(
      { _id: req.params.userId },
      { $set: { password: hashedPassword } }
    );

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Password Update Error:", err);
    res.status(500).json({ message: "Server error during password update" });
  }
});


/* ======================================================
   MFA (TWO-FACTOR AUTHENTICATION)
====================================================== */

// Toggle MFA
router.put("/toggle-mfa/:userId", async (req, res) => {
  try {
    const { enabled } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { mfaEnabled: enabled },
      { new: true }
    ).select("mfaEnabled");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error updating security settings" });
  }
});

// Setup MFA
router.post("/setup-mfa/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    const secret = speakeasy.generateSecret({
      name: `Codezy:${user.email}`
    });

    user.mfaSecret = secret.base32;
    await user.save();

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({ qrCodeUrl });
  } catch (err) {
    res.status(500).json({ message: "Error setting up MFA" });
  }
});

// Verify & Activate MFA
router.post("/verify-mfa/:userId", async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.params.userId);

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: "base32",
      token
    });

    if (!verified) {
      return res.status(400).json({ message: "Invalid 6-digit code" });
    }

    user.mfaEnabled = true;
    await user.save();

    res.json({ message: "MFA activated successfully", mfaEnabled: true });
  } catch (err) {
    res.status(500).json({ message: "Verification failed" });
  }
});

// Disable MFA
router.put("/disable-mfa/:userId", async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.userId, {
      mfaEnabled: false,
      mfaSecret: null
    });

    res.json({ mfaEnabled: false });
  } catch (err) {
    res.status(500).json({ message: "Error disabling MFA" });
  }
});

export default router;
