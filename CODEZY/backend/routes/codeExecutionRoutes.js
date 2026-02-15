import express from "express";
import axios from "axios";
import Course from "../models/Course.js";
import Student from "../models/Students.js";

const router = express.Router();

// Execution service URL
const EXECUTION_SERVICE_URL = process.env.EXECUTION_SERVICE_URL || "http://localhost:5001";

/**
 * POST /api/code-execution/run
 * Run code with test cases and structural constraints (without saving)
 * 
 * Body:
 * {
 *   code: string,
 *   language: 'python' | 'java' | 'cpp',
 *   labId: string,
 *   taskId: string,
 *   studentId: string
 * }
 */
router.post("/run", async (req, res) => {
  try {
    const { code, language, labId, taskId, studentId } = req.body;

    // Validate input
    if (!code || !language || !labId || !taskId) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: code, language, labId, taskId"
      });
    }

    // Find the lab and task to get test cases and constraints
    const course = await Course.findOne({ "classes.labs._id": labId });
    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Lab not found"
      });
    }

    // Find the specific lab
    let lab = null;
    for (const cls of course.classes) {
      const foundLab = cls.labs.find(l => l._id.toString() === labId);
      if (foundLab) {
        lab = foundLab;
        break;
      }
    }

    if (!lab) {
      return res.status(404).json({
        success: false,
        error: "Lab not found"
      });
    }

    // Find the task
    const task = lab.tasks.find(t => t._id?.toString() === taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found"
      });
    }

    // Prepare execution request
    const executionRequest = {
      code,
      language,
      testCases: task.testCases || [],
      structuralConstraints: task.codeConstraints || [],
      taskMarks: task.marks || 10
    };

    console.log(`Student ${studentId} running code for task ${taskId}`);

    // Call execution service
    const response = await axios.post(
      `${EXECUTION_SERVICE_URL}/api/execute`,
      executionRequest,
      {
        timeout: 35000, // Slightly longer than execution timeout
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Return results
    res.json(response.data);

  } catch (error) {
    console.error("Code execution error:", error.message);

    if (error.response) {
      // Error from execution service
      return res.status(error.response.status).json(error.response.data);
    }

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: "Code execution service is unavailable. Please try again later."
      });
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/code-execution/submit
 * Submit code solution for a lab task (saves submission)
 * 
 * Body:
 * {
 *   code: string,
 *   language: string,
 *   labId: string,
 *   taskId: string,
 *   studentId: string
 * }
 */
router.post("/submit", async (req, res) => {
  try {
    const { code, language, labId, taskId, studentId } = req.body;

    // Validate input
    if (!code || !language || !labId || !taskId || !studentId) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields"
      });
    }

    // First, run the code and get evaluation results
    const runResponse = await axios.post(
      `${EXECUTION_SERVICE_URL}/api/execute`,
      req.body,
      {
        timeout: 35000,
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const evaluationResults = runResponse.data;

    // Find the course and lab
    const course = await Course.findOne({ "classes.labs._id": labId });
    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Lab not found"
      });
    }

    // Find student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Student not found"
      });
    }

    // Find the class and lab
    let classObj = null;
    let labObj = null;
    for (const cls of course.classes) {
      const foundLab = cls.labs.id(labId);
      if (foundLab) {
        classObj = cls;
        labObj = foundLab;
        break;
      }
    }

    if (!labObj) {
      return res.status(404).json({
        success: false,
        error: "Lab not found"
      });
    }

    // Check if lab is still active
    const now = new Date();
    const dueDate = new Date(labObj.dueDate);
    const isLate = now > dueDate;

    // Check if student already submitted
    const existingSubmission = labObj.submissions.find(
      sub => sub.studentId.toString() === studentId
    );

    if (existingSubmission) {
      // Update existing submission
      existingSubmission.code = code;
      existingSubmission.submittedAt = new Date();
      existingSubmission.xp = Math.round(evaluationResults.score);
      existingSubmission.status = "Submitted";
      existingSubmission.isLate = isLate;
      existingSubmission.results = [{
        taskId: taskId,
        passed: evaluationResults.score >= 7, // 70% threshold
        score: evaluationResults.score
      }];
    } else {
      // Create new submission
      labObj.submissions.push({
        studentId: studentId,
        submittedAt: new Date(),
        xp: Math.round(evaluationResults.score),
        status: "Submitted",
        code: code,
        isLate: isLate,
        results: [{
          taskId: taskId,
          passed: evaluationResults.score >= 7,
          score: evaluationResults.score
        }]
      });
    }

    // Update student XP
    const xpGained = Math.round(evaluationResults.score);
    student.xp = (student.xp || 0) + xpGained;

    // Save both
    await course.save();
    await student.save();

    console.log(`Student ${studentId} submitted code for task ${taskId}. Score: ${evaluationResults.score}/10, XP gained: ${xpGained}`);

    // Return combined results
    res.json({
      success: true,
      submitted: true,
      xpGained,
      totalXp: student.xp,
      isLate,
      evaluation: evaluationResults
    });

  } catch (error) {
    console.error("Code submission error:", error.message);

    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: "Code execution service is unavailable. Please try again later."
      });
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/code-execution/quick
 * Quick code execution without test cases (for testing)
 */
router.post("/quick", async (req, res) => {
  try {
    const { code, language, input } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: code, language"
      });
    }

    const response = await axios.post(
      `${EXECUTION_SERVICE_URL}/api/execute/quick`,
      { code, language, input },
      {
        timeout: 35000,
        headers: { 'Content-Type': 'application/json' }
      }
    );

    res.json(response.data);

  } catch (error) {
    console.error("Quick execution error:", error.message);

    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/code-execution/languages
 * Get supported programming languages
 */
router.get("/languages", async (req, res) => {
  try {
    const response = await axios.get(`${EXECUTION_SERVICE_URL}/api/languages`);
    res.json(response.data);
  } catch (error) {
    res.json({
      languages: [
        { id: 'python', name: 'Python', version: '3.11' },
        { id: 'java', name: 'Java', version: '17' },
        { id: 'cpp', name: 'C++', version: 'C++17' }
      ]
    });
  }
});

export default router;
