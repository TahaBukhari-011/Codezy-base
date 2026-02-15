import React, { useState, useEffect } from 'react';
import { BookOpen, FlaskConical, Users, Plus, Upload, FileText, Sparkles, Zap, TrendingUp, Search, Filter, Calendar, MoreVertical, Clock, User, Mail, Phone, MapPin, Edit, Save, Camera, Lock, Award, Settings, Bell, Palette, Shield, Download, Eye, BarChart3 } from 'lucide-react';

// Dashboard Component
const Dashboard = () => {
  const [mounted, setMounted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [stats, setStats] = useState({ courses: 0, labs: 0, students: 0 });

  const courses = [
    {
      title: 'Programming Fundamentals',
      code: 'FA22-BCS-7B',
      status: 'Active',
      students: 32,
      labs: 8,
      statusColor: 'bg-emerald-100 text-emerald-700'
    },
    {
      title: 'Data Structures',
      code: 'FA22-BCS-5A',
      status: 'Active',
      students: 28,
      labs: 6,
      statusColor: 'bg-emerald-100 text-emerald-700'
    },
    {
      title: 'Web Development',
      code: 'SP23-BCS-3C',
      status: 'Pending',
      students: 25,
      labs: 4,
      statusColor: 'bg-yellow-100 text-yellow-700'
    },
    {
      title: 'Database Systems',
      code: 'FA22-BCS-6A',
      status: 'Active',
      students: 30,
      labs: 5,
      statusColor: 'bg-emerald-100 text-emerald-700'
    }
  ];

  const notifications = [
    {
      title: 'Lab 2 Deadline Approaching',
      description: 'Programming Fundamentals lab due in 2 days',
      color: 'bg-red-50',
      icon: '🚨',
      urgent: true
    },
    {
      title: 'New Student Enrolled',
      description: 'Web Development has 1 new student',
      color: 'bg-blue-50',
      icon: '👤',
      urgent: false
    },
    {
      title: 'Lab 3 Grading Complete',
      description: 'All submissions reviewed',
      color: 'bg-green-50',
      icon: '✅',
      urgent: false
    }
  ];

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setStats({ courses: 12, labs: 28, students: 345 });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-2xl p-6 text-white shadow-2xl transform hover:scale-[1.02] transition-all duration-500 overflow-hidden group">
            <div className="relative z-10">
              <h1 className="text-2xl font-bold mb-1">Welcome back, Prof. Ali! 👋</h1>
              <p className="text-indigo-100">Ready to inspire your students today?</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: BookOpen, color: 'text-indigo-600', label: 'Total Courses', value: stats.courses },
              { icon: FlaskConical, color: 'text-emerald-600', label: 'Active Labs', value: stats.labs },
              { icon: Users, color: 'text-cyan-600', label: 'Total Students', value: stats.students }
            ].map((stat, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/20 transform hover:scale-105 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className={stat.color} size={24} />
                </div>
                <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">My Courses</h2>
              <button className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                <Plus size={18} />
                <span>New Course</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {courses.map((course, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/20 transform hover:scale-105 hover:shadow-xl transition-all duration-500 group">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-gray-900 text-lg">{course.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${course.statusColor}`}>
                      {course.status}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-4">{course.code}</p>
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100/50">
                    <div className="text-center">
                      <p className="text-gray-500 text-xs mb-1">Students</p>
                      <p className="text-2xl font-bold text-gray-900">{course.students}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500 text-xs mb-1">Labs</p>
                      <p className="text-2xl font-bold text-gray-900">{course.labs}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Manage Students', 'Manage Labs', 'View Reports'].map((action, actionIndex) => (
                      <button key={actionIndex} className="text-xs text-gray-600 hover:text-indigo-600 font-medium transform hover:scale-105 transition-all duration-300 px-2 py-1 rounded-lg hover:bg-indigo-50">
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/20">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <Zap className="mr-2 text-yellow-500 animate-pulse" size={18} />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                <Upload size={18} />
                <span>Upload Student List</span>
              </button>
              <button className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                <Plus size={18} />
                <span>Create New Lab</span>
              </button>
              <button className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white px-4 py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                <FileText size={18} />
                <span>View Reports</span>
              </button>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/20">
            <h3 className="font-bold text-gray-900 mb-4">Notifications</h3>
            <div className="space-y-3">
              {notifications.map((notification, index) => (
                <div key={index} className={`p-3 rounded-xl ${notification.color} border-l-4 ${notification.urgent ? 'border-red-400' : 'border-blue-400'} transform hover:scale-105 transition-all duration-300`}>
                  <div className="flex items-start space-x-2">
                    <div className="text-lg">{notification.icon}</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{notification.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// My Courses Component
const MyCourses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const courses = [
    { id: 1, title: 'Programming Fundamentals', code: 'FA22-BCS-7B', status: 'Active', students: 32, labs: 8, progress: 75 },
    { id: 2, title: 'Data Structures', code: 'FA22-BCS-5A', status: 'Active', students: 28, labs: 6, progress: 60 },
    { id: 3, title: 'Web Development', code: 'SP23-BCS-3C', status: 'Pending', students: 25, labs: 4, progress: 40 }
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || course.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          My Courses
        </h1>
        <p className="text-gray-600 text-lg">Manage and monitor all your teaching courses</p>
      </div>

      <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20 mb-8">
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full lg:w-auto px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div key={course.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 transform hover:scale-105 transition-all duration-500">
            <h3 className="font-bold text-xl text-gray-900 mb-2">{course.title}</h3>
            <p className="text-sm text-gray-500 mb-3">{course.code}</p>
            <div className="flex justify-between items-center mb-4">
              <div className="text-center">
                <p className="text-gray-500 text-xs">Students</p>
                <p className="text-lg font-bold">{course.students}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-xs">Labs</p>
                <p className="text-lg font-bold">{course.labs}</p>
              </div>
            </div>
            <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300">
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Create Lab Component
const CreateLab = () => {
  const [labData, setLabData] = useState({
    title: '',
    course: '',
    description: '',
    dueDate: '',
    dueTime: ''
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Create New Lab
        </h1>
        <p className="text-gray-600 text-lg">Design and assign a new lab to your students</p>
      </div>

      <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Lab Title *</label>
            <input
              type="text"
              value={labData.title}
              onChange={(e) => setLabData({...labData, title: e.target.value})}
              placeholder="e.g., Sorting Algorithms Implementation"
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Due Date *</label>
            <input
              type="date"
              value={labData.dueDate}
              onChange={(e) => setLabData({...labData, dueDate: e.target.value})}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Due Time *</label>
            <input
              type="time"
              value={labData.dueTime}
              onChange={(e) => setLabData({...labData, dueTime: e.target.value})}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="flex gap-6 justify-center pt-8">
          <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300">
            Create Lab
          </button>
        </div>
      </div>
    </div>
  );
};

// Reports Component
const Reports = () => {
  const reports = [
    { id: 1, title: 'Programming Fundamentals - Lab 2', course: 'FA22-BCS-7B', students: 32, submitted: 28, averageScore: 78.5, status: 'completed' },
    { id: 2, title: 'Data Structures - Midterm', course: 'FA22-BCS-5A', students: 28, submitted: 28, averageScore: 82.3, status: 'completed' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-2 text-lg">Track student performance</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Recent Reports</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {reports.map((report) => (
            <div key={report.id} className="p-6">
              <h4 className="font-semibold text-gray-900 text-lg mb-2">{report.title}</h4>
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="text-gray-500">Students: </span>
                  <span className="font-medium">{report.students}</span>
                </div>
                <div>
                  <span className="text-gray-500">Submitted: </span>
                  <span className="font-medium">{report.submitted}</span>
                </div>
                <div>
                  <span className="text-gray-500">Average: </span>
                  <span className="font-medium">{report.averageScore}%</span>
                </div>
              </div>
              <button className="mt-4 flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                <Download size={16} />
                <span>Download</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Profile Component (simplified)
const Profile = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Profile Settings
        </h1>
      </div>
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h3>
        <p className="text-gray-600">Manage your account settings here</p>
      </div>
    </div>
  );
};

// Main App Component
export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-indigo-300/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${15 + Math.random() * 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      ))}
    </div>
  );

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'mycourses': return <MyCourses />;
      case 'createlab': return <CreateLab />;
      case 'reports': return <Reports />;
      case 'profile': return <Profile />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 relative overflow-hidden">
      <FloatingParticles />
      
      <div className="absolute top-1/4 -left-10 w-72 h-72 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-10 w-96 h-96 bg-gradient-to-r from-purple-400/15 to-pink-500/15 rounded-full blur-3xl animate-pulse"></div>

      <nav className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/60 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="text-indigo-600 font-bold text-xl flex items-center transform hover:scale-105 transition-transform duration-300">
                <span className="text-2xl mr-1">&lt;/&gt;</span>
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Codezy</span>
                <Sparkles className="ml-1 text-yellow-500" size={16} />
              </div>
            </div>
            <div className="hidden md:flex space-x-8">
              {['Dashboard', 'My Courses', 'Create Lab', 'Reports', 'Profile', 'Logout'].map((item) => {
                const page = item.toLowerCase().replace(' ', '');
                const isActive = currentPage === page;
                return (
                  <button
                    key={item}
                    onClick={() => item !== 'Logout' && setCurrentPage(page)}
                    className={`relative py-5 px-1 font-medium transition-all duration-300 transform hover:scale-105 ${
                      isActive ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {item}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10">
        {renderPage()}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </div>
  );
}