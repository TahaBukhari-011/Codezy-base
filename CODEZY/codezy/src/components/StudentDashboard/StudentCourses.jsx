import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import Navbar from "./Navbar";

const getCourseTheme = (code) => {
  switch (code) {
    case "PF101":
      return { icon: "💻", color: "from-blue-500 to-purple-500" };
    case "DSA303":
      return { icon: "📊", color: "from-green-500 to-teal-500" };
    case "WD202":
      return { icon: "🌐", color: "from-orange-500 to-red-500" };
    case "DS404":
      return { icon: "🗃️", color: "from-indigo-500 to-blue-500" };
    default:
      return { icon: "📚", color: "from-gray-400 to-gray-600" };
  }
};

const StudentCourses = () => {
  const studentId = localStorage.getItem("userId");
  const studentName = localStorage.getItem("fullName") || "Student";
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!studentId) {
      navigate("/login");
      return;
    }

    fetch(`http://localhost:5000/api/students/${studentId}/courses`)
      .then((res) => res.json())
      .then((data) => {
        setCourses(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching courses:", err);
        setIsLoading(false);
      });
  }, [studentId, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FD]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD] font-sans">
      {/* Shared Navbar */}
      <Navbar studentName={studentName} />

      <div className="max-w-7xl mx-auto px-8 py-10">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
            <BookOpen size={36} className="text-indigo-600" /> My Learning Journey
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Manage your enrolled courses and track your progress.
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => {
            const theme = getCourseTheme(course.courseCode);

            return (
              <motion.div
                key={course.courseId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 group cursor-pointer flex flex-col justify-between"
                onClick={() =>
                  navigate(`/student/courses/${course.courseId}/labs`)
                }
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div
                      className={`text-4xl p-4 rounded-2xl bg-gradient-to-br ${theme.color} shadow-lg text-white`}
                    >
                      {theme.icon}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                      {course.courseCode}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-1">
                    {course.title}
                  </h2>

                  <p className="text-gray-500 text-sm mb-6 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[10px] text-indigo-600 font-bold uppercase">
                      {(course.instructor || "P").charAt(0)}
                    </div>
                    Instructor:
                    <span className="font-medium text-gray-700">
                      {course.instructor || "Staff"}
                    </span>
                  </p>
                </div>

                <div className="mt-auto">
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                        Completion
                      </span>
                      <span className="font-bold text-indigo-600">
                        {course.progress || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${course.progress || 0}%` }}
                        className={`h-full bg-gradient-to-r ${theme.color}`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                        Lab Progress
                      </span>
                      <span className="text-sm font-extrabold text-gray-700">
                        {course.attemptedLabs || 0} out of{" "}
                        {course.totalLabs || 0} labs attempted
                      </span>
                    </div>
                    <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
                      <BookOpen size={18} />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudentCourses;
