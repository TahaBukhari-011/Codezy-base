import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, LogOut, Bell, LayoutDashboard, ListChecks, BookOpenCheck, LineChart,
  CreditCard, MessageSquare, UserCog, Trash2, Menu, X, Users, BookOpen, TrendingUp, Zap
} from 'lucide-react';

// Custom hook for count-up stats
const useCountUp = (end, duration = 2000) => {
  const [count, setCount] = useState(0);
  const start = 0;
  const increment = (end - start) / (duration / 16);

  useEffect(() => {
    let currentCount = start;
    const step = () => {
      currentCount += increment;
      if (currentCount < end) setCount(Math.round(currentCount));
      else setCount(end);
      if (currentCount < end) requestAnimationFrame(step);
    };
    const timer = setTimeout(() => { requestAnimationFrame(step); }, 500);
    return () => clearTimeout(timer);
  }, [end, duration, increment, start]);

  return count;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeMenu, setActiveMenu] = useState('Dashboard');

  const facultyCountTarget = 14;
  const studentsCountTarget = 312;
  const facultyCount = useCountUp(facultyCountTarget);
  const studentsCount = useCountUp(studentsCountTarget);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const topMenuItems = [
    { icon: Bell, label: 'Make Announcement', color: 'from-purple-500 to-pink-500' },
    { icon: TrendingUp, label: 'Create Competition', color: 'from-green-500 to-emerald-500' },
  ];

  const mainNavigation = [
    { icon: ListChecks, label: 'Manage Teachers' },
    { icon: BookOpenCheck, label: 'Manage Courses' },
    { icon: LineChart, label: 'View Progress' },
    { icon: CreditCard, label: 'Payment & Subscription' },
    { icon: LayoutDashboard, label: 'Dashboard', isSelected: true },
  ];

  const bottomNavigation = [
    { icon: MessageSquare, label: 'Feedback' },
    { icon: UserCog, label: 'Contact Super Admin' },
  ];

  const facultyAccessList = [
    {
      id: 1, initials: 'SM', name: 'Dr. Sarah Malik', position: 'Professor', classesManaged: 3, color: 'from-blue-500 to-cyan-500',
      subjects: [
        { name: 'PF (Programme Fundamentals)', students: 58, avgScore: '7.5/10', status: 'Active' },
        { name: 'OOP (Object Oriented Programming)', students: 42, avgScore: '8.2/10', status: 'Active' },
        { name: 'ICT (Information & Communication Tech)', students: 35, avgScore: '6.8/10', status: 'Pending' }
      ]
    },
    {
      id: 2, initials: 'AA', name: 'Mr. Asad Ali', position: 'Associate Professor', classesManaged: 2, color: 'from-purple-500 to-pink-500',
      subjects: [
        { name: 'OOP (Object Oriented Programming)', students: 45, avgScore: '8/10', status: 'Active' },
        { name: 'DSA (Data Structures & Algorithms)', students: 38, avgScore: '7/10', status: 'Active' }
      ]
    },
    {
      id: 3, initials: 'RK', name: 'Dr. Rahul Kumar', position: 'Associate Professor', classesManaged: 2, color: 'from-green-500 to-emerald-500',
      subjects: [
        { name: 'AI (Artificial Intelligence)', students: 32, avgScore: '8.7/10', status: 'Active' },
        { name: 'ML (Machine Learning)', students: 28, avgScore: '9/10', status: 'Active' }
      ]
    }
  ];
const handleLogout = () => {
    // 1. Clear Local Storage
    try {
      localStorage.clear();
      console.log("Local storage cleared upon logout.");
    } catch (error) {
      console.error("Could not clear local storage:", error);
    }

    // 2. Navigate to the login page
    navigate('/login');
  };
  const handleMenuItemClick = (label) => {
    setActiveMenu(label);
    if (isMobile) setSidebarOpen(false);

    switch (label) {
      case 'Manage Teachers':
        navigate('/admin/teachers');
        break;
      case 'Manage Courses':
        navigate('/admin/courses');
        break;
      case 'View Progress':
        navigate('/admin/progress');
        break;
      case 'Payment & Subscription':
        navigate('/admin/payments');
        break;
      case 'Dashboard':
        navigate('/admin');
        break;
      default:
        break;
    }
  };

  const getStatusColor = (status) => status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 font-semibold' : 'bg-amber-500/10 text-amber-600 font-semibold';

  const sidebarVariants = {
    open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } }
  };

  const statsVariants = {
    hidden: { y: 50, opacity: 0, scale: 0.9 },
    visible: (i) => ({ y: 0, opacity: 1, scale: 1, transition: { delay: i * 0.2, type: 'spring', stiffness: 100, damping: 15 } })
  };

  const FacultyCard = ({ faculty, index }) => (
    <motion.div
      custom={index}
      variants={statsVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1),0 10px 10px -5px rgba(0,0,0,0.04)' }}
      className="bg-white rounded-xl p-5 shadow-lg border border-gray-100/70"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 bg-gradient-to-r ${faculty.color} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md`}>
            {faculty.initials}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{faculty.name}</h3>
            <p className="text-gray-500 text-sm">{faculty.position}</p>
          </div>
        </div>
        <button className="text-red-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors">
          <Trash2 size={18} />
        </button>
      </div>

      <p className="text-sm font-medium text-gray-700 mb-3 border-b pb-3 border-gray-100">
        Total classes managed: <span className="font-bold text-blue-600">{faculty.classesManaged}</span>
      </p>

      <div className="space-y-4">
        {faculty.subjects.map((subject, idx) => (
          <div key={idx} className="bg-gray-50 p-3 rounded-lg flex justify-between items-start text-sm">
            <div className="flex flex-col space-y-1">
              <span className="font-medium text-gray-800">{subject.name}</span>
              <span className="text-xs text-gray-500">Students: {subject.students}</span>
            </div>
            <div className="flex flex-col items-end space-y-1">
              <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(subject.status)}`}>{subject.status}</span>
              <span className="text-sm font-bold text-gray-900">Avg. Score: {subject.avgScore}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
          View complete profile <span className="ml-1">→</span>
        </button>
      </div>
    </motion.div>
  );

  const SidebarItem = ({ icon: Icon, label, isSelected }) => {
    const defaultColor = isSelected ? 'text-white' : 'text-blue-200';
    const activeBg = isSelected ? 'bg-indigo-600/50 backdrop-blur-sm shadow-xl' : 'hover:bg-blue-700/50';
    const baseClasses = `w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-300 relative group`;
    return (
      <motion.button
        onClick={() => handleMenuItemClick(label)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`${baseClasses} ${activeBg} ${defaultColor}`}
      >
        <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-700' : 'bg-blue-800/70'} shadow-md`}>
          <Icon size={20} className={defaultColor} />
        </div>
        <span className="font-medium">{label}</span>
      </motion.button>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 relative overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div variants={sidebarVariants} initial={isMobile ? "closed" : "open"} animate={sidebarOpen || !isMobile ? "open" : "closed"} 
        className="fixed md:relative z-50 w-72 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col h-full shadow-2xl">
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center shadow-lg">
              <Zap size={18} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">Codezy</h1>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          {topMenuItems.map((item) => <SidebarItem key={item.label} icon={item.icon} label={item.label} isSelected={activeMenu === item.label} />)}
          <div className="my-6 border-t border-gray-700/50"></div>
          {mainNavigation.map((item) => <SidebarItem key={item.label} icon={item.icon} label={item.label} isSelected={activeMenu === item.label} />)}
          <div className="my-6 border-t border-gray-700/50"></div>
          {bottomNavigation.map((item) => <SidebarItem key={item.label} icon={item.icon} label={item.label} isSelected={activeMenu === item.label} />)}
        </nav>

        {/* Logout Button */}
       {/* Logout Button (MODIFIED SECTION) */}
        <div className="p-4 border-t border-gray-700/50">
          {/* Removed <a> tag and its href. The navigation is now handled by handleLogout via React Router. */}
          <motion.button
            // The key change: attach the logout function to onClick
            onClick={handleLogout} 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 shadow-md text-white transition-all"
          >
            <div className="p-2 bg-red-700/50 rounded-lg flex items-center justify-center">
              <LogOut size={20} />
            </div>
            <span className="font-medium">Logout</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <nav className="bg-white shadow-md sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            </div>
          </div>
        </nav>

        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[{ title: 'Total Faculty Members', value: facultyCount, icon: Users, color: 'from-blue-500 to-cyan-500' },
              { title: 'Total Students Enrolled', value: studentsCount, icon: BookOpen, color: 'from-purple-500 to-pink-500' }].map((stat, index) => (
              <motion.div key={stat.title} custom={index} variants={statsVariants} initial="hidden" animate="visible"
                whileHover={{ scale: 1.05, y: -5, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
                className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100/70 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">{stat.title}</p>
                    <motion.p className="text-5xl font-extrabold text-gray-900">{stat.value}</motion.p>
                  </div>
                  <div className={`p-4 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                    <stat.icon className="text-white" size={32} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Faculty grid */}
          <motion.div className="bg-white rounded-2xl shadow-xl border border-gray-100/70 overflow-hidden"
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}>
            <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Faculty Access List</h2>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input type="text" placeholder="Search faculty..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm w-40 sm:w-64" />
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors shadow-md">
                  <Plus size={20} />
                </motion.button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {facultyAccessList.map((faculty, index) => (
                  <FacultyCard key={faculty.id} faculty={faculty} index={index} />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
