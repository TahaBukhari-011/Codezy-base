import React, { useEffect, useState } from 'react';
import NotificationDropdown from '../NotificationDropdown';
import ChatWidget from '../ai/ChatWidget'; // <-- Import your existing chatbot component
import axios from 'axios';
import { 
  Bell, Search, MessageCircle, X, Send, 
  BookOpen, Trophy, Flame, TrendingUp, 
  Maximize2, Minimize2, LogOut 
} from 'lucide-react';  

const LearnerDashboard = () => {
  const [data, setData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Levels");

  const userId = localStorage.getItem("userId");
  const fullName = localStorage.getItem("fullName") || "Jordan";

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
    // Fetching dashboard data from the established learner routes
    axios.get(`http://localhost:5000/api/learners/dashboard-data/${userId}`)
      .then(res => setData(res.data))
      .catch(err => console.error("Error fetching dashboard:", err));
  }, [userId]);

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium text-sm">Loading Codezy...</p>
      </div>
    </div>
  );

  const filteredCourses = (data.recommended || []).filter(course => {
    const title = course?.title || "";
    const instructor = course?.instructor || "";
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All Levels" || course?.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB] relative font-sans">
      
      {/* --- 1. NAVIGATION BAR --- */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-8">
          <a href="/learner-dashboard" className="text-purple-700 font-bold text-xl flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80">
            <div className="bg-purple-700 text-white px-1.5 py-0.5 rounded-md text-sm font-mono">{"</>"}</div> 
            Codezy
          </a>
          
          <div className="hidden md:flex gap-6 text-sm font-semibold text-gray-500">
            <a href="/courses" className="hover:text-purple-700 transition-colors">Courses</a>
            <a href="/roadmap" className="hover:text-purple-700 transition-colors">Roadmap</a>
            <a href="/labs" className="hover:text-purple-700 transition-colors">Labs</a>
            <a href="/achievements" className="hover:text-purple-700 transition-colors">Achievements</a>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <NotificationDropdown />
          
          {/* LOGOUT BUTTON */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-red-600 font-bold text-xs transition-colors px-3 py-2 rounded-xl hover:bg-red-50"
          >
            <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
          </button>

          <a href="/learner-profile" className="w-9 h-9 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 font-bold uppercase cursor-pointer hover:bg-purple-200 transition-colors">
             {fullName.charAt(0)}
          </a>
        </div>
      </nav>

      {/* --- 2. COMPACT STATS HEADER --- */}
      <header className="bg-gradient-to-r from-[#7C3AED] via-[#A21CAF] to-[#DB2777] p-8 text-white shadow-md">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">Good Evening, {fullName}! 👋</h1>
          <p className="text-purple-100 text-sm mt-1">Welcome back to your learning journey!</p>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <StatCard label="Total XP" value={data.stats?.totalXp || 0} sub="Level 8" icon={<Trophy size={18}/>} />
            <StatCard label="Completed Labs" value={data.stats?.completedLabs || 0} sub="5 in progress" icon={<BookOpen size={18}/>} />
            <StatCard label="Learning Streak" value={`${data.stats?.learningStreak || 0} days`} sub="Keep it up!" icon={<Flame size={18}/>} />
            <StatCard label="XP This Week" value={`+${data.stats?.xpThisWeek || 0} XP`} sub="15% increase" icon={<TrendingUp size={18}/>} />
          </div>
        </div>
      </header>

      {/* --- 3. MAIN CONTENT --- */}
      <main className="max-w-7xl mx-auto p-6 space-y-12 pb-24">
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Continue Learning</h2>
            <a href="/labs" className="text-purple-600 text-xs font-bold hover:underline">Browse All Labs →</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(data.enrolled || []).map(item => (
              <ContinueCard key={item._id} course={item.courseId} progress={item.progress} />
            ))}
          </div>
        </section>

        <section>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search courses..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-purple-500 text-sm outline-none" 
              />
            </div>
            <div className="flex gap-2">
              {['All Levels', 'Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                <button 
                  key={lvl} 
                  onClick={() => setActiveCategory(lvl)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    activeCategory === lvl ? 'bg-purple-700 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <h2 className="text-lg font-bold text-gray-800 mb-4">Explore Available Courses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCourses.length > 0 ? (
              filteredCourses.map(course => <CourseCard key={course._id} course={course} />)
            ) : (
              <div className="col-span-full py-10 text-center text-gray-400 text-sm border border-dashed rounded-2xl">No courses found matching your criteria.</div>
            )}
          </div>
        </section>
      </main>

      {/* --- 4. AI CHAT COMPONENT --- */}
          {data && (
      <ChatWidget
        context={{
          userName: fullName,
          stats: data.stats,
          enrolledCourses: (data.enrolled || []).map(e => e.courseId?.title)
        }}
      />
    )}

    </div>
  );
};

// --- REUSABLE CARD COMPONENTS ---
const StatCard = ({ label, value, sub, icon }) => (
  <div className="bg-white/15 backdrop-blur-md p-4 rounded-xl border border-white/20 flex items-center gap-4 transition-transform hover:scale-105 cursor-default">
    <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center">{icon}</div>
    <div>
      <p className="text-[10px] opacity-80 uppercase font-bold leading-none">{label}</p>
      <p className="text-lg font-bold mt-0.5">{value}</p>
      <p className="text-[10px] opacity-70 font-medium">{sub}</p>
    </div>
  </div>
);

const ContinueCard = ({ course, progress }) => (
  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition-shadow group">
    <div className="w-28 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
      <img src={course?.thumbnail || "/placeholder.jpg"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
    </div>
    <div className="flex-1 flex flex-col justify-between min-w-0">
      <div>
        <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded uppercase">
          {course?.category || "Beginner"}
        </span>
        <h3 className="font-bold text-gray-800 text-xs mt-1 truncate">{course?.title}</h3>
      </div>
      <div className="mt-2">
        <div className="flex justify-between text-[10px] font-bold mb-1">
          <span className="text-purple-600">{progress}%</span>
          <span className="text-gray-400">150 XP</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="bg-purple-600 h-full transition-all duration-700" style={{ width: `${progress}%` }}></div>
        </div>
        <button className="w-full mt-2 bg-purple-600 text-white text-[10px] py-1.5 rounded-lg font-bold hover:bg-purple-700 transition-colors active:scale-95">Continue</button>
      </div>
    </div>
  </div>
);

const CourseCard = ({ course }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all hover:-translate-y-1">
    <img src={course?.thumbnail || "/placeholder.jpg"} className="h-32 w-full object-cover" alt="" />
    <div className="p-4">
      <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded uppercase">{course?.category}</span>
      <h3 className="font-bold text-gray-800 text-xs mt-2 line-clamp-2 h-8">{course?.title}</h3>
      <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-50">
        <span className="text-sm font-bold text-gray-800">${course?.price || 0}</span>
        <button className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-purple-700 transition-colors active:scale-95">Details</button>
      </div>
    </div>
  </div>
);

export default LearnerDashboard;
