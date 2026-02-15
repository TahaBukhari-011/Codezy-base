import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  BookOpen, 
  CreditCard, 
  BarChart3, 
  Megaphone, 
  MessageSquare,
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'Manage Institutions', icon: <Building2 size={20} />, path: '/manage-institutions' },
    { name: 'Add Courses', icon: <BookOpen size={20} />, path: '/add-courses' },
    { name: 'Subscription Plans Management', icon: <CreditCard size={20} />, path: '/subscriptions' },
    { name: 'View Reports & Analytics', icon: <BarChart3 size={20} />, path: '/reports' },
    { name: 'Make Announcement', icon: <Megaphone size={20} />, path: '/announcements' },
    { name: 'Feedbacks', icon: <MessageSquare size={20} />, path: '/feedbacks' },
  ];

  const handleLogout = () => {
    // Clear your auth tokens here
    localStorage.removeItem('token'); 
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-screen w-64 bg-[#0F1121] text-white fixed left-0 top-0 border-r border-gray-800">
      {/* Logo Section */}
      <div className="p-6 flex items-center gap-2 mb-4">
        <div className="text-indigo-500 font-bold text-2xl font-mono">{"</>"}</div>
        <h1 className="text-xl font-semibold tracking-tight">Codezy</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium
                ${isActive 
                  ? 'bg-[#6366F1] text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              {item.icon}
              <span className="text-left">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout Section */}
      <div className="p-4 mt-auto border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-colors duration-200 text-sm font-medium"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;