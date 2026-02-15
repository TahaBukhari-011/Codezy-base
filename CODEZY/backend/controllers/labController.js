import Lab from "../models/Lab.js";
import Class from "../models/Class.js";
import { notifyEvent } from "../services/events.js";

export const createLab = async (req, res) => {
  try {
    const { title, courseId, classId } = req.body;

    const lab = await Lab.create({
      title,
      course: courseId,
      class: classId,
      createdBy: req.user.id
    });

    const classData = await Class.findById(classId).populate("students");
    const studentIds = classData.students.map(s => s._id);

    // Get io from app
    const io = req.app.get("io");

    // Emit event with io
    await notifyEvent("NEW_LAB", {
      teacherId: req.user.id,
      labTitle: title,
      studentIds,
      classId, // important for room
      tenantId: req.user.tenantId
    }, req.app.get("io"));

    res.status(201).json(lab);
  } catch (error) {
    console.error("Error creating lab:", error);
    res.status(500).json({ message: "Server error creating lab" });
  }
};

