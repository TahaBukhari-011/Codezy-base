import express from "express";
import Student from "../models/Students.js";
import Course from "../models/Course.js";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import bcrypt from "bcryptjs";
const router = express.Router();

// Helper to determine UI themes based on Course Code (as seen in your snippet)
const getDisplayProps = (courseCode) => {
    switch (courseCode) {
        case 'PF101': return { icon: '💻', color: 'from-blue-500 to-purple-500', instructor: 'Dr. Sarah Malik' };
        case 'DSA303': return { icon: '📊', color: 'from-green-500 to-teal-500', instructor: 'Dr. Ali Ahmed' };
        case 'WD202': return { icon: '🌐', color: 'from-orange-500 to-red-500', instructor: 'Dr. Rizwan Khan' };
        case 'DS404': return { icon: '🗃️', color: 'from-indigo-500 to-blue-500', instructor: 'Dr. Nida Shah' };
        default: return { icon: '📚', color: 'from-gray-400 to-gray-600', instructor: 'Staff' };
    }
};

/* =============================================================
   1. STUDENT DASHBOARD DATA
============================================================= */
router.get("/:studentId/dashboard-data", async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId).lean();
    if (!student) return res.status(404).json({ message: "Student not found" });

    const course = await Course.findById(student.course).lean();
    if (!course) return res.json({ studentName: student.name, activeLabs: [], courses: [] });

    const studentClass = course.classes.find(
      c => c._id.toString() === student.classId.toString()
    );

    const activeLabs = (studentClass?.labs || [])
    .filter(lab => lab.status === "Active")
    .map(lab => ({
        _id: lab._id,
        title: lab.title,
        marks: lab.marks,
        dueDate: lab.dueDate,
        course: course.title, // ADD THIS LINE TO SEND THE COURSE TITLE
        progress: 0 
    }));

    res.json({
      studentName: student.name,
      xp: student.xp,
      activeLabs,
      coursesSummary: [{
        courseId: course._id,
        title: course.title,
        courseCode: course.courseCode
      }]
    });
  } catch (err) {
    res.status(500).json({ message: "Dashboard error" });
  }
});

router.get("/:studentId/achievements", async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId).lean();
        
        // Mocked Achievements Data based on your mockup
        res.json({
            totalXp: student.xp || 0,
            weeklyXp: 420,
            tier: "Silver",
            nextTierPercent: 97,
            xpToNext: 50,
            earnedCount: 10,
            lockedCount: 13,
            totalCount: 23,
            completion: 43,
            badges: [
                { title: "First Steps", description: "Complete your first lab in Programming Fundamentals", category: "Programming", xpAward: 50, isLocked: false, earnedDate: "Sep 15, 2023" },
                { title: "Code Warrior", description: "Complete 5 labs in Programming Fundamentals", category: "Programming", xpAward: 100, isLocked: false, earnedDate: "Oct 1, 2023" },
                { title: "PF Master", description: "Score above 90% in 3 consecutive PF labs", category: "Programming", xpAward: 150, isLocked: true, progress: 67 },
                { title: "Quick Learner", description: "Complete a PF lab under time limit", category: "General", xpAward: 80, isLocked: false, earnedDate: "Sep 22, 2023" },
                { title: "OOP Novice", description: "Complete your first OOP lab", category: "Object-Oriented", xpAward: 60, isLocked: true, progress: 0 },
            ]
        });
    } catch (err) {
        res.status(500).json({ message: "Error fetching achievements" });
    }
});
/* -------------------------------------
   4. CHANGE PASSWORD
-------------------------------------- */
router.post("/:studentId/change-password", async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const student = await Student.findById(req.params.studentId);

        if (!student) return res.status(404).json({ message: "Student not found" });

        // 1. Validate Complexity (8 chars, 1 Upper, 1 Digit, 1 Symbol)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({ 
                message: "Complexity requirement not met: 8+ chars, 1 uppercase, 1 digit, and 1 symbol required." 
            });
        }

        // 2. Verify Current Password
        const isMatch = await bcrypt.compare(currentPassword, student.password);
        if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

        // 3. Hash and Save
        const salt = await bcrypt.genSalt(10);
        student.password = await bcrypt.hash(newPassword, salt);
        await student.save();

        res.json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});
/* =============================================================
   2. UPDATE STUDENT ACADEMICS (XP & PROGRESS)
   This route is called when a student completes a lab
============================================================= */
router.post("/:studentId/update-stats", async (req, res) => {
    try {
        const { studentId } = req.params;
        const { xpEarned, newProgress } = req.body;

        // Update the central Student record
        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            { 
                $inc: { xp: xpEarned },
                $set: { progress: newProgress }
            },
            { new: true }
        );

        res.json({ 
            message: "Academic stats updated", 
            currentXp: updatedStudent.xp 
        });
    } catch (err) {
        res.status(500).json({ message: "Error updating student stats" });
    }
});
router.get("/:studentId/courses", async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId).lean();
    if (!student) return res.status(404).json({ message: "Student not found" });

    const course = await Course.findById(student.course)
      .populate("classes.teacher", "name")
      .lean();

    const cls = course.classes.find(
      c => c._id.toString() === student.classId.toString()
    );

    res.json([{
      courseId: course._id,
      title: course.title,
      courseCode: course.courseCode,
      instructor: cls.teacher?.name || "Instructor",
      progress: student.progress || 0
    }]);
  } catch (err) {
    res.status(500).json({ message: "Courses fetch error" });
  }
});

router.get("/:studentId/courses/:courseId/labs", async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    const student = await Student.findById(studentId).lean();
    const course = await Course.findById(courseId)
      .populate("classes.teacher", "name")
      .lean();

    if (!student || !course) return res.status(404).json({ message: "Data not found" });

    const studentClass = course.classes.find(
      c => c._id.toString() === student.classId.toString()
    );

    if (!studentClass) return res.json({ active: [], history: [] });

    const active = [];
    const history = [];

    studentClass.labs.forEach(lab => {
      // Logic: Only show labs that are NOT "Draft"
      if (lab.status !== "Draft") {
        const labData = {
          ...lab,
          createdBy: lab.createdBy?.name || studentClass.teacher?.name,
          tasks: lab.tasks || [], // Ensure tasks array is sent to frontend
          courseCode: course.courseCode
        };

        // Split into Pending and Completed for the UI
        lab.status === "Active" ? active.push(labData) : history.push(labData);
      }
    });

    res.json({ active, history });
  } catch (err) {
    res.status(500).json({ message: "Error fetching labs" });
  }
});
// Get specific lab details for the Lab Session page
// GET: Fetch full lab details for the session page
router.get("/lab-details/:labId", async (req, res) => {
  try {
    const { labId } = req.params;

    // Use MongoDB projection to find the specific course containing this lab
    const course = await Course.findOne(
      { "classes.labs._id": labId },
      { "classes.$": 1, "title": 1, "courseCode": 1 } // Only return the relevant class
    ).lean();

    if (!course) {
      return res.status(404).json({ message: "Lab not found in any courses." });
    }

    // Extract the specific lab from the returned class
    const targetClass = course.classes[0];
    const lab = targetClass.labs.find(l => l._id.toString() === labId);

    if (!lab) return res.status(404).json({ message: "Lab data corrupted." });

    // Respond with combined lab and course metadata
    res.json({
      ...lab,
      courseTitle: course.title,
      courseCode: course.courseCode,
      teacherName: targetClass.teacher?.name || "Instructor"
    });

  } catch (err) {
    console.error("Backend Lab Fetch Error:", err);
    res.status(500).json({ message: "Internal server error fetching lab." });
  }
});
/* =============================================================
   3. GET STUDENT PROFILE (With Dynamic Stats)
============================================================= */
router.get("/:studentId/profile", async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId).select("-password").lean();
        if (!student) return res.status(404).json({ message: "Student not found" });

        // Find the course and class the student is in
        const course = await Course.findById(student.course).lean();
        
        let stats = {
            enrolledCourses: 0,
            completedLabs: 0,
            pendingLabs: 0
        };

        if (course) {
            stats.enrolledCourses = 1; // Student is enrolled in this course

            const studentClass = course.classes.find(
                c => c._id.toString() === student.classId?.toString()
            );

            if (studentClass) {
                // Total labs that are "Active" and not "Draft"
                const totalActiveLabs = studentClass.labs.filter(l => l.status === "Active");
                
                // Count completed based on the student's academic record
                // Assuming student.completedLabs is an array of IDs
                stats.completedLabs = student.completedLabs?.length || 0;
                
                // Pending = Total Active Labs - Completed
                stats.pendingLabs = Math.max(0, totalActiveLabs.length - stats.completedLabs);
            }
        }

        // Return profile data combined with calculated stats
        res.json({
            ...student,
            stats // Sending calculated numbers to frontend
        });
    } catch (err) {
        res.status(500).json({ message: "Error fetching profile stats" });
    }
});

/* -------------------------------------
   STUDENT MFA & SECURITY ROUTES
-------------------------------------- */
/* -------------------------------------
   1. SETUP: Generate and PERSIST Secret
-------------------------------------- */
router.get("/:studentId/mfa/setup", async (req, res) => {
  const student = await Student.findById(req.params.studentId);
  if (!student) return res.status(404).json({ message: "Student not found" });

  let secret;

  if (!student.mfaSecret) {
    secret = speakeasy.generateSecret({
      name: `Codezy:${student.email}`,
      issuer: "Codezy"
    });

    student.mfaSecret = secret.base32;
    student.mfaEnabled = false;
    await student.save();
  } else {
    secret = {
      base32: student.mfaSecret,
      otpauth_url: speakeasy.otpauthURL({
        secret: student.mfaSecret,
        label: `Codezy:${student.email}`,
        issuer: "Codezy",
        encoding: "base32"
      })
    };
  }

  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
  res.json({ qrCodeUrl });
});

/* -------------------------------------
   2. VERIFY: Retrieve and Compare
-------------------------------------- */
router.post("/:studentId/mfa/verify", async (req, res) => {
    try {
        const { token } = req.body;
        // Do NOT use .select("-password") here if it might interfere with other fields; 
        // Just fetch the document normally
        const student = await Student.findById(req.params.studentId);

        // This is where your current error "No secret found" is triggered
        if (!student || !student.mfaSecret) {
            return res.status(400).json({ 
                message: "No secret found in database. Please refresh and scan a new QR code." 
            });
        }

        const isVerified = speakeasy.totp.verify({
            secret: student.mfaSecret,
            encoding: 'base32',
            token: String(token).trim(),
            window: 2 // Margin for network/time sync issues
        });

        if (isVerified) {
            await Student.findByIdAndUpdate(req.params.studentId, { mfaEnabled: true });
            res.json({ message: "MFA Enabled successfully" });
        } else {
            res.status(400).json({ message: "Invalid code. Please try again." });
        }
    } catch (err) {
        res.status(500).json({ message: "Server error during verification" });
    }
});

// 3. DISABLE: Remove MFA
router.post("/:studentId/mfa/disable", async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId);
        if (!student) return res.status(404).json({ message: "Student not found" });

        student.mfaSecret = null;
        student.mfaEnabled = false;
        await student.save();
        res.json({ message: "MFA Disabled" });
    } catch (err) {
        res.status(500).json({ message: "Error disabling MFA" });
    }
});

export default router;