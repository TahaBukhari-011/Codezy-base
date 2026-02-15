import React, { useState } from 'react';
import NotificationDropdown from '../NotificationDropdown';
import ChatWidget from '../ai/ChatWidget'; // <-- Modular AI chat
import { 
  Bell, MessageCircle, X, Send, Maximize2, Minimize2, 
  CheckCircle, PlayCircle, Lock, Trophy, Timer, Code, LogOut 
} from 'lucide-react';

const LabsPage = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [chatMessage, setChatMessage] = useState("");

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

  const labStats = [
    { label: "Completed", value: "2 Labs", icon: <CheckCircle className="text-green-500" />, color: "bg-green-50 border-green-100" },
    { label: "In Progress", value: "1 Labs", icon: <PlayCircle className="text-purple-500" />, color: "bg-purple-50 border-purple-100" },
    { label: "Available", value: "3 Labs", icon: <Code className="text-blue-500" />, color: "bg-blue-50 border-blue-100" },
    { label: "Total XP", value: "1,230 XP", icon: <Trophy className="text-yellow-500" />, color: "bg-yellow-50 border-yellow-100" },
  ];

  const labs = [
    {
      id: 1,
      title: "Build a Todo App with React Hooks",
      category: "Modern Web Development with React",
      description: "Create a fully functional todo application using React hooks and local storage.",
      difficulty: "Beginner",
      time: "45 min",
      xp: 100,
      status: "completed",
      progress: 95
    },
    {
      id: 2,
      title: "Implement Binary Search Tree",
      category: "Data Structures & Algorithms",
      description: "Build a binary search tree with insert, delete, and search operations.",
      difficulty: "Intermediate",
      time: "60 min",
      xp: 150,
      status: "in-progress"
    },
    {
      id: 3,
      title: "Create a REST API with Python Flask",
      category: "Complete Python Programming",
      description: "Design and implement a RESTful API with CRUD operations using Flask.",
      difficulty: "Intermediate",
      time: "90 min",
      xp: 200,
      status: "available"
    },
    {
      id: 4,
      title: "Build a Weather App with API Integration",
      category: "JavaScript Modern Development",
      description: "Fetch and display weather data from an external API using async/await.",
      difficulty: "Beginner",
      time: "50 min",
      xp: 120,
      status: "completed",
      progress: 88
    },
    {
      id: 5,
      title: "Build a Chat Application with WebSockets",
      category: "Modern Web Development with React",
      description: "Create a real-time chat app using WebSockets and React.",
      difficulty: "Advanced",
      time: "120 min",
      xp: 300,
      status: "locked",
      unlockCriteria: "Complete Level 3"
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans relative">
      {/* --- NAVIGATION --- */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-8">
          <a href="/learner-dashboard" className="text-purple-700 font-bold text-xl flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="bg-purple-700 text-white px-1.5 py-0.5 rounded-md text-sm font-mono">{"</>"}</div> 
            Codezy
          </a>
          <div className="hidden md:flex gap-2 text-sm font-semibold">
            <a href="/courses" className="text-gray-500 hover:text-purple-700 px-4 py-2 transition-colors">Courses</a>
            <a href="/roadmap" className="text-gray-500 hover:text-purple-700 px-4 py-2 transition-colors">Roadmap</a>
            <a href="/labs" className="bg-purple-50 text-purple-700 px-4 py-2 rounded-xl transition-all font-bold">Labs</a>
            <a href="/achievements" className="text-gray-500 hover:text-purple-700 px-4 py-2 transition-colors">Achievements</a>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <NotificationDropdown />
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

      <main className="max-w-7xl mx-auto p-10">
        <header className="mb-10">
          <h1 className="text-2xl font-bold text-gray-800">Coding Labs</h1>
          <p className="text-gray-500 text-sm mt-1">Hands-on coding exercises to practice and reinforce your skills</p>
        </header>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {labStats.map((stat, idx) => (
            <div key={idx} className={`${stat.color} border p-4 rounded-2xl flex items-center gap-4 transition-transform hover:scale-105 shadow-sm`}>
              <div className="bg-white p-2 rounded-xl shadow-sm">{stat.icon}</div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{stat.label}</p>
                <p className="text-lg font-black text-gray-800 mt-1">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* --- LABS GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {labs.map(lab => (
            <div key={lab.id} className={`bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 flex flex-col transition-all hover:shadow-xl ${lab.status === 'locked' ? 'opacity-70 grayscale' : ''}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-gray-800 text-md">{lab.title}</h3>
                    {lab.status === 'completed' && (
                      <span className="bg-green-100 text-green-700 text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                        Completed {lab.progress}%
                      </span>
                    )}
                    {lab.status === 'in-progress' && (
                      <span className="bg-purple-100 text-purple-700 text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                         In Progress
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium mb-4 italic">{lab.category}</p>
                </div>
                {lab.status === 'locked' ? <Lock size={18} className="text-gray-400" /> : null}
              </div>

              <p className="text-sm text-gray-600 mb-6 line-clamp-2 leading-relaxed">{lab.description}</p>

              <div className="flex items-center gap-4 mb-8">
                <span className="bg-yellow-50 text-yellow-700 text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider border border-yellow-100">{lab.difficulty}</span>
                <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-bold uppercase">
                  <Timer size={14} /> {lab.time}
                </div>
                <div className="flex items-center gap-1.5 text-purple-600 text-[11px] font-black uppercase">
                  <Trophy size={14} /> {lab.xp} XP
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-50">
                {lab.status === 'completed' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button className="bg-white border border-gray-200 text-gray-700 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors">Review Solution</button>
                    <button className="bg-pink-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-pink-700 transition-all active:scale-95">Retry Lab</button>
                  </div>
                ) : lab.status === 'in-progress' ? (
                  <button className="w-full bg-purple-600 text-white py-3 rounded-xl text-xs font-black hover:bg-purple-700 shadow-lg shadow-purple-100 transition-all active:scale-95">Continue Lab</button>
                ) : lab.status === 'locked' ? (
                  <button disabled className="w-full bg-gray-200 text-gray-400 py-3 rounded-xl text-xs font-black cursor-not-allowed">Locked</button>
                ) : (
                  <button className="w-full bg-gradient-to-r from-[#DB2777] to-[#7C3AED] text-white py-3 rounded-xl text-xs font-black hover:opacity-90 shadow-lg shadow-pink-100 transition-all active:scale-95">Start Lab</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* --- AI COACH CHAT --- */}
      <ChatWidget /> {/* <-- Modular chatbot, replaces static AI coach UI */}

    </div>
  );
};

export default LabsPage;
