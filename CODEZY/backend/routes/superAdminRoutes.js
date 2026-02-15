const express = require('express');
const router = express.Router();
const Course = require('../models/Course'); // Adjust path to your schema
const Student = require('../models/Student');

router.get('/superadmin/stats', async (req, res) => {
  try {
    // 1. Get Global Stats
    const totalStudents = await Student.countDocuments();
    const totalCourses = await Course.countDocuments();
    
    // Aggregation to count all labs across all courses/classes
    const labStats = await Course.aggregate([
      { $unwind: "$classes" },
      { $project: { numberOfLabs: { $size: { $ifNull: ["$classes.labs", []] } } } },
      { $group: { _id: null, totalLabs: { $sum: "$numberOfLabs" } } }
    ]);

    // 2. Get Data for "Individual Courses" section
    const individualCourses = await Course.find()
      .select('title classes')
      .lean();

    const formattedCourses = individualCourses.map(course => {
      let totalLectures = 0;
      let studentSet = new Set();
      
      course.classes?.forEach(cls => {
        totalLectures += cls.labs?.length || 0;
        cls.students?.forEach(s => studentSet.add(s.toString()));
      });

      return {
        title: course.title,
        lectures: totalLectures,
        students: studentSet.size
      };
    });

    res.json({
      stats: {
        institutions: 0, // Update this once you add an Institution model
        individuals: totalStudents,
        activeUsers: totalStudents + 10, // Mocking active users for now
      },
      courses: formattedCourses
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/superadmin/global-stats', async (req, res) => {
  const [
    totalInstitutions,
    totalIndividuals,
    totalUsers,
    totalCourses
  ] = await Promise.all([
    Institution.countDocuments({ type: 'institution' }),
    Institution.countDocuments({ type: 'individual' }),
    User.countDocuments(),
    Course.countDocuments()
  ]);

  res.json({
    totalInstitutions,
    totalIndividuals,
    totalUsers,
    totalCourses
  });
});

router.get('/superadmin/institutions', async (req, res) => {
  const report = await Institution.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'tenantId',
        foreignField: 'tenantId',
        as: 'users'
      }
    },
    {
      $lookup: {
        from: 'courses',
        localField: 'tenantId',
        foreignField: 'tenantId',
        as: 'courses'
      }
    },
    {
      $project: {
        name: 1,
        adminEmail: 1,
        tenantId: 1,
        type: 1,
        createdAt: 1,

        teacherCount: {
          $size: {
            $filter: {
              input: '$users',
              as: 'u',
              cond: { $eq: ['$$u.role', 'teacher'] }
            }
          }
        },

        studentCount: {
          $size: {
            $filter: {
              input: '$users',
              as: 'u',
              cond: { $eq: ['$$u.role', 'student'] }
            }
          }
        },

        courseCount: { $size: '$courses' }
      }
    }
  ]);

  res.json(report);
});

// routes/admin.js
router.get('/superadmin/institutions-report', async (req, res) => {
  try {
    const report = await Institution.aggregate([
      {
        $lookup: {
          from: 'users', // Assuming Teachers/Students are in the users collection
          localField: 'tenantId',
          foreignField: 'tenantId',
          as: 'allUsers'
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'tenantId',
          foreignField: 'tenantId',
          as: 'allCourses'
        }
      },
      {
        $project: {
          name: 1,
          adminEmail: 1,
          tenantId: 1,
          createdAt: 1,
          // Count teachers (filter by role)
          teacherCount: {
            $size: {
              $filter: {
                input: "$allUsers",
                as: "u",
                cond: { $eq: ["$$u.role", "teacher"] }
              }
            }
          },
          // Count students (filter by role)
          studentCount: {
            $size: {
              $filter: {
                input: "$allUsers",
                as: "u",
                cond: { $eq: ["$$u.role", "student"] }
              }
            }
          },
          // Count total courses created by this institution
          courseCount: { $size: "$allCourses" }
        }
      }
    ]);

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;