import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Building2, BookOpen, Users, BarChart3, LogOut, 
  TrendingUp, Zap, Menu, X, Plus, Search, Trash2, Globe 
} from 'lucide-react';

// Animation variants matching Institutional Admin
const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: (i) => ({ 
    y: 0, 
    opacity: 1, 
    transition: { delay: i * 0.1, type: 'spring', stiffness: 100 } 
  })
};

// Custom hook for the count-up effect
const useCountUp = (end, duration = 2000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime;
    const animate = (now) => {
      if (!startTime) startTime = now;
      const progress = Math.min((now - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);
  return count;
};

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ summary: { institutions: 0, individuals: 0, activeUsers: 0 }, institutions: [], individualCourses: [] });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fetch real data from your backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/superadmin/dashboard-stats');
        setData(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0F1121]">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="text-indigo-500">
        <Zap size={48} />
      </motion.div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* --- SIDEBAR (Institutional Admin Style) --- */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? '288px' : '0px' }}
        className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col shadow-2xl overflow-hidden relative"
      >
        <div className="p-6 border-b border-gray-700/50 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">Codezy</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          <SidebarItem icon={<LayoutDashboard size={20}/>} label="Dashboard" active onClick={() => navigate('/admin')} />
          <SidebarItem icon={<Building2 size={20}/>} label="Manage Institutions" onClick={() => navigate('/admin/institutions')} />
          <SidebarItem icon={<BookOpen size={20}/>} label="Global Courses" onClick={() => navigate('/admin/courses')} />
          <SidebarItem icon={<BarChart3 size={20}/>} label="Analytics" onClick={() => navigate('/admin/reports')} />
        </nav>

        <div className="p-4 border-t border-gray-700/50">
          <motion.button 
            onClick={handleLogout}
            whileHover={{ scale: 1.02 }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-600/90 hover:bg-red-600 text-white shadow-lg transition-all"
          >
            <LogOut size={20} /> <span className="font-medium">Logout</span>
          </motion.button>
        </div>
      </motion.aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white shadow-sm border-b border-gray-100 px-8 py-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h2 className="text-xl font-bold text-gray-800">SuperAdmin Hub</h2>
          </div>
          <div className="flex items-center gap-4">
             <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Global search..." className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm w-64 focus:ring-2 focus:ring-indigo-500 outline-none" />
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">System Overview</h1>
            <p className="text-gray-500 mt-1">Real-time statistics across all Codezy nodes.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatedStatCard 
                label="Total Institutions" 
                value={data.summary.institutions} 
                icon={<Building2 size={28}/>} 
                color="from-indigo-600 to-blue-500" 
                index={0} 
            />
            <AnimatedStatCard 
                label="Total Learners" 
                value={data.summary.individuals} 
                icon={<Users size={28}/>} 
                color="from-purple-600 to-pink-500" 
                index={1} 
            />
             <AnimatedStatCard 
                label="Active Systems" 
                value={data.summary.activeUsers} 
                icon={<Globe size={28}/>} 
                color="from-emerald-600 to-teal-500" 
                index={2} 
            />
          </div>

          {/* Institution List Table-style Cards */}
          <section>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Managed Institutions</h3>
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-all shadow-md text-sm font-semibold">
                    <Plus size={18} /> Add New Node
                </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {data.institutions.map((inst, i) => (
                    <motion.div 
                        key={i} custom={i} variants={cardVariants} initial="hidden" animate="visible"
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl hover:shadow-2xl transition-all group"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                    <Building2 size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-lg">{inst.name}</h4>
                                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-wider">Verified System</span>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                        </div>
                        <div className="grid grid-cols-3 gap-4 border-t border-gray-50 pt-6">
                            <DataDetail label="Learners" value={inst.students} />
                            <DataDetail label="Staff" value={inst.teachers} />
                            <DataDetail label="Courses" value={inst.courses} />
                        </div>
                    </motion.div>
                ))}
            </div>
          </section>

          {/* Bottom Grid for Individual Content */}
          <section>
             <h3 className="text-xl font-bold text-gray-800 mb-6">Course Performance Tracking</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {data.individualCourses.map((course, i) => (
                    <motion.div 
                        key={i} custom={i + 4} variants={cardVariants} initial="hidden" animate="visible"
                        className="bg-white p-5 rounded-2xl border border-gray-100 shadow-lg hover:border-indigo-200 transition-all cursor-pointer group"
                    >
                        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-indigo-600 mb-4 transition-colors">
                            <BookOpen size={20} />
                        </div>
                        <h4 className="font-bold text-gray-800 mb-4 truncate text-sm">{course.title}</h4>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500 font-medium">Labs: <b className="text-gray-900">{course.lectures}</b></span>
                            <span className="text-gray-500 font-medium">Enrolled: <b className="text-gray-900">{course.students}</b></span>
                        </div>
                    </motion.div>
                ))}
             </div>
          </section>
        </main>
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const SidebarItem = ({ icon, label, active, onClick }) => (
    <motion.button
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group
        ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
    >
      <div className={`p-2 rounded-lg ${active ? 'bg-white/20' : 'bg-gray-800 group-hover:bg-gray-700'}`}>
        {icon}
      </div>
      <span className="font-semibold text-sm">{label}</span>
    </motion.button>
);

const AnimatedStatCard = ({ label, value, icon, color, index }) => {
    const count = useCountUp(value);
    return (
        <motion.div 
            custom={index} variants={cardVariants} initial="hidden" animate="visible"
            whileHover={{ y: -5, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)' }}
            className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 flex justify-between items-center relative overflow-hidden group"
        >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-[0.03] -mr-10 -mt-10 rounded-full group-hover:scale-150 transition-transform duration-500`} />
            <div>
                <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">{label}</p>
                <h2 className="text-5xl font-black text-gray-900 tracking-tighter">{count}</h2>
            </div>
            <div className={`p-5 rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg transform group-hover:rotate-6 transition-transform`}>
                {icon}
            </div>
        </motion.div>
    );
};

const DataDetail = ({ label, value }) => (
    <div className="text-center">
        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">{label}</p>
        <p className="text-lg font-extrabold text-indigo-600">{value}</p>
    </div>
);

export default SuperAdminDashboard;