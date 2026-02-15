import express from "express";
import Teacher from "../models/Teacher.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import multer from "multer";
import Papa from "papaparse";
import Course from "../models/Course.js";
import Student from "../models/Students.js";
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/* ========================
   AUTH HELPERS
======================== */
const getAuthContext = (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new Error("Unauthorized");
    const token = authHeader.split(" ")[1];
    return jwt.verify(token, process.env.JWT_SECRET); // returns object with tenantId
};

/* ========================
   TEACHER STATS HELPER
======================== */
const getTeacherStats = async (teacherIds = [], tenantId) => {
    const matchStage = teacherIds.length > 0
        ? { $match: { tenantId, "classes.teacher": { $in: teacherIds.map(id => new mongoose.Types.ObjectId(id)) } } }
        : { $match: { tenantId, "classes.teacher": { $exists: true } } };

    const stats = await Course.aggregate([
        { $unwind: "$classes" },
        matchStage,
        {
            $group: {
                _id: "$classes.teacher",
                courseIds: { $addToSet: "$_id" },
                classNames: { $addToSet: "$classes.name" },
                studentCount: { $sum: { $size: { $ifNull: ["$classes.students", []] } } }
            }
        }
    ]);
    return stats;
};

/* ========================
   GET ALL TEACHERS
======================== */
router.get("/", async (req, res) => {
    try {
        const { tenantId } = getAuthContext(req);

        const teachers = await Teacher.find({ tenantId }).sort({ createdAt: -1 }).select("-password").lean();
        const stats = await getTeacherStats([], tenantId);

        const enrichedTeachers = teachers.map(t => {
            const teacherStat = stats.find(s => s._id.toString() === t._id.toString());
            return {
                ...t,
                courseLoad: teacherStat ? teacherStat.courseIds.length : 0,
                classesLoad: teacherStat ? teacherStat.classNames.length : 0,
                students: teacherStat ? teacherStat.studentCount : 0,
                courses: teacherStat ? teacherStat.courseIds : [],
                classes: teacherStat ? teacherStat.classNames : []
            };
        });

        res.json(enrichedTeachers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* ========================
   GET SINGLE TEACHER
======================== */
router.get("/:id", async (req, res) => {
    try {
        const { tenantId } = getAuthContext(req);

        const teacher = await Teacher.findOne({ _id: req.params.id, tenantId }).select("-password").lean();
        if (!teacher) return res.status(404).json({ message: "Teacher not found" });

        const stats = await getTeacherStats([teacher._id], tenantId);
        const s = stats[0] || { courseIds: [], classNames: [], studentCount: 0 };

        res.json({
            ...teacher,
            courseLoad: s.courseIds.length,
            classesLoad: s.classNames.length,
            students: s.studentCount,
            courses: s.courseIds,
            classes: s.classNames
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* ========================
   CREATE SINGLE TEACHER
======================== */
router.post("/", async (req, res) => {
    try {
        const { tenantId } = getAuthContext(req);
        const { name, email, role, department, password, status } = req.body;

        const existing = await Teacher.findOne({ email: email.toLowerCase(), tenantId });
        if (existing) return res.status(400).json({ message: "Email already exists" });

        const teacher = new Teacher({
            name,
            email: email.toLowerCase(),
            role,
            status: status || "Active",
            department: Array.isArray(department) ? department : department?.split(',').map(d => d.trim()),
            password: password || crypto.randomBytes(6).toString("hex"),
            tenantId
        });

        await teacher.save();
        res.status(201).json({ message: "Teacher created" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/* ========================
   UPDATE TEACHER
======================== */
router.put("/:id", async (req, res) => {
    try {
        const { tenantId } = getAuthContext(req);
        const teacher = await Teacher.findOne({ _id: req.params.id, tenantId });
        if (!teacher) return res.status(404).json({ message: "Teacher not found" });

        const { password, ...updateData } = req.body;
        Object.assign(teacher, updateData);

        if (password && password.trim() !== "") teacher.password = password;

        await teacher.save();
        res.json({ message: "Updated successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* ========================
   BULK TEACHERS UPLOAD
======================== */
router.post("/bulk", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "CSV file is required" });
        const { tenantId } = getAuthContext(req);

        const csvString = req.file.buffer.toString("utf-8");
        const { data: items } = Papa.parse(csvString, { header: true, skipEmptyLines: true });

        const prepared = items.map(t => ({
            name: t.Name?.trim() || "",
            email: t.Email?.trim().toLowerCase() || "",
            role: t.Role?.trim() || "",
            status: "Active",
            department: t.Department ? t.Department.split(',').map(d => d.trim()).filter(Boolean) : [],
            password: t.Password?.trim() || crypto.randomBytes(6).toString("hex"),
            tenantId
        }));

        const unique = prepared.filter((t, index, self) =>
            t.email && self.findIndex(prev => prev.email === t.email && prev.tenantId === t.tenantId) === index
        );

        const teachersToCreate = unique.map(t => new Teacher(t));
        await Promise.all(teachersToCreate.map(t => t.save()));

        res.json({ message: `Successfully imported ${unique.length} teachers.` });
    } catch (err) {
        console.error("Bulk upload error:", err);
        res.status(500).json({ message: "Bulk upload failed", error: err.message });
    }
});

/* ========================
   DELETE TEACHER
======================== */
router.delete("/:id", async (req, res) => {
    try {
        const { tenantId } = getAuthContext(req);
        await Teacher.findOneAndDelete({ _id: req.params.id, tenantId });
        res.json({ message: "Teacher deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
///* ========================
//   TEACHER OVERVIEW
//======================== */
router.get('/:id/overview', async (req, res) => {
  try {
    const teacherId = new mongoose.Types.ObjectId(req.params.id);

    // 1️⃣ Find courses that include this teacher in classes or labs
    const courses = await Course.find({
      $or: [
        { "classes.teacher": teacherId },
        { "labs.teacher": teacherId }
      ]
    }).lean();

    // 2️⃣ Extract classes/labs for this teacher and fetch student IDs
    let allClasses = [];
    let studentIds = new Set();

    courses.forEach(course => {
      // Filter classes for this teacher
      const teacherClasses = (course.classes || []).filter(c => c.teacher?.toString() === teacherId.toString());
      const teacherLabs = (course.labs || []).filter(l => l.teacher?.toString() === teacherId.toString());

      teacherClasses.forEach(c => {
        allClasses.push({ ...c, courseId: course._id, courseName: course.name });
        (c.students || []).forEach(sid => studentIds.add(sid.toString()));
      });

      teacherLabs.forEach(l => {
        allClasses.push({ ...l, courseId: course._id, courseName: course.name, type: "lab" });
        (l.students || []).forEach(sid => studentIds.add(sid.toString()));
      });
    });

    // 3️⃣ Fetch actual student documents
    const students = await Student.find({ _id: { $in: Array.from(studentIds) } }).lean();

    res.json({
      courses,
      classes: allClasses,
      students
    });
  } catch (err) {
    console.error("Overview error:", err);
    res.status(500).send("Server Error");
  }
});

/* ========================
   2FA SETUP / VERIFY / DISABLE
======================== */
router.get("/:id/2fa/setup", async (req, res) => {
    try {
        const { tenantId } = getAuthContext(req);
        const teacher = await Teacher.findOne({ _id: req.params.id, tenantId });
        if (!teacher) return res.status(404).json({ message: "Teacher not found" });

        const secret = speakeasy.generateSecret({ name: `Codezy:${teacher.email}` });
        teacher.twoFactorSecret = secret.base32;
        await teacher.save();

        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
        res.json({ qrCodeUrl, secret: secret.base32 });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/:id/2fa/verify", async (req, res) => {
    try {
        const { tenantId } = getAuthContext(req);
        const { token } = req.body;
        const teacher = await Teacher.findOne({ _id: req.params.id, tenantId });
        if (!teacher) return res.status(404).json({ message: "Teacher not found" });

        const verified = speakeasy.totp.verify({
            secret: teacher.twoFactorSecret,
            encoding: 'base32',
            token
        });

        if (verified) {
            teacher.isTwoFactorEnabled = true;
            await teacher.save();
            res.json({ message: "2FA enabled successfully" });
        } else {
            res.status(400).json({ message: "Invalid code." });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/:id/2fa/disable", async (req, res) => {
    try {
        const { tenantId } = getAuthContext(req);
        const teacher = await Teacher.findOne({ _id: req.params.id, tenantId });
        if (!teacher) return res.status(404).json({ message: "Teacher not found" });

        teacher.twoFactorSecret = null;
        teacher.isTwoFactorEnabled = false;
        await teacher.save();
        res.json({ message: "2FA disabled successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
