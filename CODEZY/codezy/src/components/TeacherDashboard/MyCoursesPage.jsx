import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Users, FlaskConical, MoreVertical, 
  Sparkles, Zap, BookOpen 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyCoursesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [stats, setStats] = useState({ total: 0, active: 0, students: 0, labs: 0 });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchTeacherCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const teacherId = localStorage.getItem("userId");
      if (!teacherId || !token) return;

      const res = await fetch(`http://localhost:5000/api/courses/teacher/${teacherId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${Text}`);
      const data = await res.json();
      setCourses(data || []);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchTeacherCourses(); 
  }, []);

  const flattenedCourses = useMemo(() => {
    const arr = [];
    courses.forEach(course => {
      // Logic: A class inherits the status of its parent course
      if (course.classes?.length) {
        course.classes.forEach(cl => {
          arr.push({ 
            ...course, 
            status: course.status || 'Active', // Ensure status exists for filtering
            singleClass: cl 
          });
        });
      }
    });
    return arr;
  }, [courses]);

  useEffect(() => {
    const total = flattenedCourses.length;
    const active = flattenedCourses.filter(c => c.status === 'Active').length;
    // Updated to count IDs in the reference array correctly
    const students = flattenedCourses.reduce((sum, course) => sum + (course.singleClass?.students?.length || 0), 0);
    const labs = flattenedCourses.reduce((sum, course) => sum + (course.singleClass?.labs?.length || 0), 0);
    setStats({ total, active, students, labs });
  }, [flattenedCourses]);

  // FIX: Filtering logic now specifically checks the inherited course status
  const filteredCourses = flattenedCourses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.courseCode?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'All' || course.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const StatsOverview = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[
        { label: 'Total Classes', value: stats.total, icon: BookOpen, color: 'from-indigo-500 to-purple-500' },
        { label: 'Active Status', value: stats.active, icon: Zap, color: 'from-emerald-500 to-green-500' },
        { label: 'Enrolled Students', value: stats.students, icon: Users, color: 'from-cyan-500 to-blue-500' },
        { label: 'Total Labs', value: stats.labs, icon: FlaskConical, color: 'from-amber-500 to-orange-500' }
      ].map((stat, index) => (
        <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
              <stat.icon className="text-white" size={24} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
          <p className="text-gray-600 text-sm">{stat.label}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 relative overflow-hidden">
      
      {/* Navbar */}
      <motion.nav initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="text-indigo-600 font-bold text-xl flex items-center">
                <span className="text-2xl mr-1">&lt;/&gt;</span>
                <span>Codezy</span>
                <Sparkles size={16} className="ml-2 text-yellow-500" />
              </div>
            </div>
            <div className="hidden md:flex space-x-8 font-medium">
              <a href="/teacher" className="hover:text-indigo-600 transition">Dashboard</a>
              <a href="/mycourses" className="text-indigo-600 border-b-2 border-indigo-600">My Courses</a>
              <a href="/createlab" className="hover:text-indigo-600 transition">Create Lab</a>
              <a href="/reports" className="hover:text-indigo-600 transition">Reports</a>
              <a href="/profile" className="hover:text-indigo-600 transition">Profile</a>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="max-w-7xl mx-auto p-6 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            My Courses
          </h1>
          <p className="text-gray-600 text-lg">Monitor your classes and manage student lab performance</p>
        </div>

        <StatsOverview />

        {/* Search & Filter Section */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search courses by title or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              />
            </div>
            <div className="flex items-center gap-4 w-full lg:w-auto">
              {/* Custom Styled Select */}
              <div className="relative flex-1 lg:w-48">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-4 pr-10 py-4 border-2 border-gray-200 rounded-xl bg-white outline-none appearance-none font-semibold text-gray-700 focus:border-indigo-500 transition-all"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active Only</option>
                  <option value="Inactive">Inactive Only</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                   ▼
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Courses List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16 bg-white/80 rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-xl font-semibold">No courses match your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={`${course._id}-${index}`} 
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-500 group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-xl text-gray-900 mb-1">{course.title}</h3>
                        <span className={`w-2 h-2 rounded-full ${course.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    </div>
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-tight">{course.courseCode}</p>
                    <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full mt-3 uppercase tracking-widest border border-indigo-100">
                      Class: {course.singleClass?.name}
                    </div>
                  </div>
                  <MoreVertical size={20} className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 pt-6 border-t border-gray-100/50">
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-blue-50/30">
                    <div className="p-2 bg-blue-500 rounded-lg text-white"><Users size={16} /></div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Students</p>
                      <p className="text-sm font-bold text-gray-700">{course.singleClass?.students?.length || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-emerald-50/30">
                    <div className="p-2 bg-emerald-500 rounded-lg text-white"><FlaskConical size={16} /></div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Labs</p>
                      <p className="text-sm font-bold text-gray-700">{course.singleClass?.labs?.length || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <button 
                    onClick={() => navigate(`/courses/${course._id}/class/${course.singleClass._id}/students`)}
                    className="flex-1 bg-white border-2 border-indigo-100 text-indigo-600 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-50 transition-all active:scale-95"
                  >
                    Enrolled Students
                  </button>
                  <button 
                    onClick={() => navigate(`/courses/${course._id}/class/${course.singleClass._id}/labs`)}
                    className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                  >
                    Lab History
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCoursesPage;