import React, { useEffect, useState } from 'react';
import NotificationDropdown from '../NotificationDropdown';
import ChatWidget from '../ai/ChatWidget';
import axios from 'axios';
import { 
  Search, BookOpen, LogOut 
} from 'lucide-react';

const CoursesPage = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Levels");
  const userId = localStorage.getItem("userId");
  const fullName = localStorage.getItem("fullName") || "User";

  // --- LOGOUT LOGIC ---
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("userId");
      localStorage.removeItem("fullName");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    if (userId) {
      axios
        .get(`http://localhost:5000/api/learners/dashboard-data/${userId}`)
        .then(res => setEnrolledCourses(res.data.enrolled || []))
        .catch(err => console.error(err));
    }
  }, [userId]);

  const filtered = enrolledCourses.filter(item => {
    const title = item.courseId?.title || "";
    const instructor = item.courseId?.instructor || "";
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "All Levels" ||
      item.courseId?.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-white font-sans relative">
      {/* --- NAV BAR --- */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-8">
          <a href="/learner-dashboard" className="text-purple-700 font-bold text-xl flex items-center gap-2">
            <div className="bg-purple-700 text-white px-1.5 py-0.5 rounded-md text-sm font-mono">
              {"</>"}
            </div>
            Codezy
          </a>

          <div className="hidden md:flex gap-2 text-sm font-semibold">
            <a href="/courses" className="bg-purple-50 text-purple-700 px-4 py-2 rounded-xl font-bold">
              Courses
            </a>
            <a href="/roadmap" className="text-gray-500 hover:text-purple-700 px-4 py-2">
              Roadmap
            </a>
            <a href="/labs" className="text-gray-500 hover:text-purple-700 px-4 py-2">
              Labs
            </a>
            <a href="/achievements" className="text-gray-500 hover:text-purple-700 px-4 py-2">
              Achievements
            </a>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <NotificationDropdown />

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-red-600 font-bold text-xs px-3 py-2 rounded-xl hover:bg-red-50"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>

          <a
            href="/learner-profile"
            className="w-9 h-9 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 font-bold uppercase"
          >
            {fullName.charAt(0)}
          </a>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-10">
        <header className="mb-10">
          <h1 className="text-2xl font-bold text-gray-800">My Courses</h1>
          <p className="text-gray-500 text-sm mt-1">
            View and continue learning your enrolled courses
          </p>
        </header>

        {/* SEARCH + FILTER */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search your courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-100 outline-none text-sm"
            />
          </div>

          <div className="flex gap-2">
            {['All Levels', 'Beginner', 'Intermediate', 'Advanced'].map(level => (
              <button
                key={level}
                onClick={() => setActiveCategory(level)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold border ${
                  activeCategory === level
                    ? 'bg-purple-700 text-white border-purple-700'
                    : 'bg-white text-gray-500 border-gray-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* COURSE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.length ? (
            filtered.map(item => (
              <div
                key={item._id}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all"
              >
                <img
                  src={item.courseId?.thumbnail || "/placeholder.jpg"}
                  className="h-48 w-full object-cover rounded-t-3xl"
                  alt={item.courseId?.title}
                />

                <div className="p-6">
                  <h3 className="font-bold text-gray-800">{item.courseId?.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    by {item.courseId?.instructor}
                  </p>

                  <div className="mt-4">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-600 h-full"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {item.progress}% completed
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-24 text-center">
              <BookOpen className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-400">No courses found.</p>
            </div>
          )}
        </div>
      </main>

      {/* --- AI COACH CHAT --- */}
      <ChatWidget />
    </div>
  );
};

export default CoursesPage;
