import React, { useState } from 'react';
import NotificationDropdown from '../NotificationDropdown';
import ChatWidget from '../ai/ChatWidget';
import { 
  Trophy, CheckCircle, Circle, Lock, 
  ArrowRight, MessageCircle, Bell, 
  X, Maximize2, Minimize2, Send, LogOut 
} from 'lucide-react';

const RoadmapPage = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [chatMessage, setChatMessage] = useState("");

  const fullName = localStorage.getItem("fullName") || "User";
   const data = {
    stats: {},
    enrolled: []
  };

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

  const roadmapStages = [
    {
      id: 1,
      title: "Programming Fundamentals",
      description: "Master the basics of programming with Python and JavaScript",
      xp: 500,
      status: "completed",
      courses: ["Complete Python Programming Bootcamp", "JavaScript Modern Development"],
      feedback: "Completed! Great job!"
    },
    {
      id: 2,
      title: "Web Development",
      description: "Build modern web and mobile applications",
      xp: 750,
      status: "active",
      progress: 40,
      courses: ["Modern Web Development with React", "Mobile App Development with React Native"]
    },
    {
      id: 3,
      title: "Data Structures & Algorithms",
      description: "Master essential DSA concepts for technical interviews",
      xp: 1000,
      status: "active",
      progress: 25,
      courses: ["Data Structures & Algorithms Masterclass"]
    },
    {
      id: 4,
      title: "Advanced Topics",
      description: "Dive into advanced computer science topics",
      xp: 1500,
      status: "locked",
      unlockCriteria: "Complete Data Structures & Algorithms",
      courses: ["Machine Learning Fundamentals", "System Design"]
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans relative">
      {/* --- NAVIGATION BAR --- */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-8">
          <a href="/learner-dashboard" className="text-purple-700 font-bold text-xl flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="bg-purple-700 text-white px-1.5 py-0.5 rounded-md text-sm font-mono">{"</>"}</div> 
            Codezy
          </a>
          
          <div className="hidden md:flex gap-2 text-sm font-semibold">
            <a href="/courses" className="text-gray-500 hover:text-purple-700 px-4 py-2 transition-colors">Courses</a>
            <a href="/roadmap" className="bg-purple-50 text-purple-700 px-4 py-2 rounded-xl transition-all font-bold">Roadmap</a>
            <a href="/labs" className="text-gray-500 hover:text-purple-700 px-4 py-2 transition-colors">Labs</a>
            <a href="/achievements" className="text-gray-500 hover:text-purple-700 px-4 py-2 transition-colors">Achievements</a>
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

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-4xl mx-auto p-10">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Your Learning Roadmap</h1>
          <p className="text-gray-500 text-sm mt-1">Follow this structured path to become a proficient software developer</p>
        </header>

        {/* Overall Progress Banner */}
        <div className="bg-gradient-to-r from-[#D91B5C] via-[#7C3AED] to-[#7C3AED] rounded-2xl p-6 text-white mb-10 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-[10px] font-bold uppercase opacity-80">Overall Progress</p>
              <h2 className="text-lg font-bold">Level 2 of 5 Complete</h2>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <Trophy size={20} className="text-yellow-400" />
                <span className="text-lg font-bold">2,750 XP</span>
              </div>
              <p className="text-[10px] opacity-80 uppercase">Total Earned</p>
            </div>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 w-[40%] rounded-full shadow-inner"></div>
          </div>
        </div>

        {/* Roadmap Stages */}
        <div className="space-y-6">
          {roadmapStages.map((stage) => (
            <RoadmapCard key={stage.id} stage={stage} />
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center bg-white border border-purple-100 rounded-2xl p-8">
          <p className="text-sm font-bold text-gray-800 mb-2">Keep Learning! 🚀</p>
          <p className="text-xs text-gray-500 mb-6">You're making great progress. Continue with your current courses to unlock new milestones.</p>
          <button className="bg-purple-600 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-purple-700 shadow-lg shadow-purple-100 transition-all active:scale-95">
            View My Courses
          </button>
        </div>
      </main>

      {/* --- AI COACH CHAT --- */}
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

// Sub-component for each Roadmap section
const RoadmapCard = ({ stage }) => {
  const isCompleted = stage.status === "completed";
  const isActive = stage.status === "active";
  const isLocked = stage.status === "locked";

  return (
    <div className={`rounded-3xl border p-6 transition-all ${
      isCompleted ? 'bg-green-50 border-green-200 shadow-sm' : 
      isActive ? 'bg-white border-purple-200 shadow-md' : 
      'bg-gray-50 border-gray-200 opacity-60'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isCompleted ? 'bg-green-100 text-green-600' : isActive ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-400'
          }`}>
            {isCompleted ? <CheckCircle size={24} /> : isLocked ? <Lock size={20} /> : <Circle size={24} />}
          </div>
          <div>
            <h3 className={`font-bold text-lg ${isLocked ? 'text-gray-500' : 'text-gray-800'}`}>{stage.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{stage.description}</p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 shadow-sm ${
          isCompleted ? 'bg-green-100 border-green-200 text-green-700' : 'bg-purple-50 border-purple-100 text-purple-700'
        }`}>
          <Trophy size={14} className={isCompleted ? 'text-green-600' : 'text-purple-600'} />
          <span className="text-[10px] font-black uppercase tracking-widest">{stage.xp} XP</span>
        </div>
      </div>

      {!isLocked && (
        <div className="ml-14">
          {isActive && (
            <div className="mb-6">
              <div className="flex justify-between text-[10px] font-extrabold text-purple-600 mb-2 uppercase tracking-widest">
                <span>{stage.progress}% Complete</span>
                <span className="text-gray-400">Target Reached: 15/20</span>
              </div>
              <div className="h-2.5 bg-purple-100 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full transition-all duration-1000 ease-out shadow-sm" style={{ width: `${stage.progress}%` }}></div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-6">
            {stage.courses.map((course, i) => (
              <span key={i} className="bg-white border border-gray-100 text-gray-600 px-4 py-2 rounded-xl text-[10px] font-bold shadow-sm hover:border-purple-200 transition-colors">
                {course}
              </span>
            ))}
          </div>

          {isCompleted ? (
            <div className="bg-green-100/50 p-3 rounded-2xl w-fit">
              <p className="text-[10px] font-black text-green-700 flex items-center gap-2 uppercase">
                <CheckCircle size={14} /> {stage.feedback}
              </p>
            </div>
          ) : (
            <button className="bg-purple-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black flex items-center gap-2 hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 uppercase tracking-widest">
              Continue Learning <ArrowRight size={14} />
            </button>
          )}
        </div>
      )}

      {isLocked && (
        <div className="ml-14 mt-4 flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-widest border-t border-gray-100 pt-4">
          <Lock size={14} /> Unlock by: {stage.unlockCriteria}
        </div>
      )}
    </div>
  );
};

export default RoadmapPage;
