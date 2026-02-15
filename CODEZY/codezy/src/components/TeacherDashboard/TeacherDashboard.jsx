import React, { useState, useEffect } from 'react';
import { 
  BookOpen, FlaskConical, Users, Sparkles, Zap, TrendingUp, FileText, ChevronRight 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from "react-router-dom";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ labs: 0, students: 0 });
  const [teacherId, setTeacherId] = useState(null);
  const [teacherName, setTeacherName] = useState("");
  const [teacherLabs, setTeacherLabs] = useState([]);
  const [hoveredLab, setHoveredLab] = useState(null);

  // Fetch labs from all courses & classes
  const fetchTeacherLabs = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/courses/teacher/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const coursesData = await res.json();
      const labsFromCourses = [];
      coursesData.forEach(course => {
        if (course.classes?.length) {
          course.classes.forEach(cl => {
            cl.labs?.forEach(lab => {
              labsFromCourses.push({
                ...lab,
                courseTitle: course.title,
                courseCode: course.courseCode,
                className: cl.name,
                students: cl.students?.length || 0,
                submissionsCount: lab.submissions?.length || 0,
                parentClassId: cl._id,
                courseId: course._id 
              });
            });
          });
        }
      });

      setTeacherLabs(labsFromCourses);
    } catch (err) {
      console.error("Error fetching labs:", err);
      setTeacherLabs([]);
    } finally {
      setLoading(false);
    }
  };

  // Load teacher info
  useEffect(() => {
    const id = localStorage.getItem("userId");
    const name = localStorage.getItem("fullName");
    if (!id) return;

    setTeacherId(id);
    setTeacherName(name);
    fetchTeacherLabs(id);
  }, []);

  //useEffect(() => {
    //if (teacherId) fetchTeacherLabs(teacherId);
  //}, [teacherId]);

  // Updated stats logic to include old labs (no status) as active
  useEffect(() => {
    const labsCount = teacherLabs?.filter(lab => lab.status === "Active" || !lab.status).length || 0;
    const studentsCount = teacherLabs?.reduce((total, lab) => total + (lab.students || 0), 0) || 0;
    setStats({ labs: labsCount, students: studentsCount });
  }, [teacherLabs]);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("fullName");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login"); 
  };

  const getLifecycleColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Draft': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Closed': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-emerald-100 text-emerald-700 border-emerald-200'; // Default color for old labs
    }
  };

  const getProgressColor = (progress) => {
    switch (progress) {
      case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Logic to separate lists
  // Old labs without a status field are treated as "Active"
  const activeLabsList = teacherLabs.filter(lab => lab.status === "Active" || !lab.status);
  const draftLabsList = teacherLabs.filter(lab => lab.status === "Draft");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 relative overflow-hidden">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/60 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xl">
              <span className="text-2xl">&lt;/&gt;</span>
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Codezy</span>
              <Sparkles className="text-yellow-500 animate-spin-slow" size={16} />
            </div>
            <div className="hidden md:flex space-x-8">
              <a className="py-5 px-1 text-indigo-600 font-medium" href="/teacher">Dashboard</a>
              <a className="py-5 px-1 text-gray-600" href="/mycourses">My Courses</a>
              <a className="py-5 px-1 text-gray-600" href="/createlab">Create Lab</a>
              <a className="py-5 px-1 text-gray-600" href="/profile">Profile</a>
              <button className="py-5 px-1 text-gray-600 hover:text-indigo-600 transition duration-150" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-2xl p-6 text-white shadow-xl">
              <h1 className="text-2xl font-bold mb-1">Welcome back, {teacherName || "Teacher"}! 👋</h1>
              <p className="text-indigo-100">Ready to inspire your students today?</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[ 
                { icon: FlaskConical, label: 'Active Labs', value: stats.labs },
                { icon: Users, label: 'Total Students', value: stats.students }
              ].map((stat, index) => (
                <div key={index} className="bg-white rounded-2xl p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <stat.icon className="text-indigo-600" size={24} />
                    <TrendingUp className="text-emerald-500" size={16} />
                  </div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Active Labs Section (Includes previously created labs) */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                   <FlaskConical className="text-indigo-600" size={20}/>
                   My Active Labs
                </h2>
              </div>

              {loading ? (
                <p className="text-gray-500">Loading labs...</p>
              ) : activeLabsList.length === 0 ? (
                <div className="bg-white/50 border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center text-gray-500 italic">
                   No active labs available.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {activeLabsList.map((lab) => (
                    <div 
                      key={lab._id}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 flex flex-col gap-3 transform hover:scale-105 hover:shadow-xl transition-all duration-500"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg text-gray-900">{lab.title}</h3>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getLifecycleColor(lab.status)}`}>
                            {lab.status || 'Active'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getProgressColor(lab.progressStatus)}`}>
                            {lab.progressStatus}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-500">{lab.courseTitle} ({lab.courseCode}) — Class: {lab.className}</p>
                      
                      {/* Restore statistics display for Active labs */}
                      <div className="flex gap-4 text-xs text-gray-500 flex-wrap items-center">
                        <span className="flex items-center gap-1"><Users size={12} /> {lab.students} students</span>
                        <span className="flex items-center gap-1"><FlaskConical size={12} /> {lab.submissionsCount} submissions</span>
                      </div>

                      <div className="mt-2">
                        <button onClick={() => navigate(`/courses/${lab.courseId}/class/${lab.parentClassId}/labs/${lab._id}/submissions`)} 
                          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold">
                          View Submissions
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Drafts Section - Separated lower down */}
            {draftLabsList.length > 0 && (
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="text-gray-400" size={20} />
                  <h2 className="text-lg font-bold text-gray-500">Drafts & Unfinished Work</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {draftLabsList.map((lab) => (
                    <div key={lab._id} className="bg-gray-100/50 border border-gray-200 rounded-2xl p-4 flex flex-col justify-between hover:bg-white transition-all duration-300 group">
                      <div>
                        <h4 className="font-bold text-gray-700">{lab.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{lab.courseCode} • {lab.className}</p>
                      </div>
                      <button 
                        onClick={() => navigate(`/createlab/${lab._id}/${lab.courseId}/${lab.parentClassId}`)}
                        className="mt-3 text-indigo-600 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all"
                      >
                        Continue Editing <ChevronRight size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (Actions) */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 shadow-lg">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <Zap className="mr-2 text-yellow-500" size={18} />
                Quick Actions
              </h3>
              <button onClick={() => navigate(`/course-students`)} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-xl hover:shadow-md transition-all">
                Upload Student List
              </button>
              <Link to="/createlab">
                <button className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-3 rounded-xl hover:shadow-md transition-all">
                  Create New Lab
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}