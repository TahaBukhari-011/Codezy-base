import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import NotificationDropdown from '../NotificationDropdown';

const Navbar = ({ studentName }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
      {/* Left: Logo + Navigation Links */}
      <div className="flex items-center gap-8">
        {/* Logo Clickable */}
        <div
          className="text-indigo-600 font-bold text-xl flex items-center gap-1 cursor-pointer"
          onClick={() => navigate('/student')}
        >
          <span className="text-2xl font-black">&lt;/&gt;</span>
          <span>Codezy</span>
        </div>

        {/* Navigation Links (Dashboard removed) */}
        <div className="flex gap-6 text-sm font-medium text-gray-500">
          <button
            className="hover:text-indigo-600 transition"
            onClick={() => navigate('/student/courses')}
          >
            Courses
          </button>

          <button
            className="hover:text-indigo-600 transition"
            onClick={() => navigate('/student/achievements')}
          >
            Achievements
          </button>
        </div>
      </div>

      {/* Right: Notifications + Profile + Logout */}
      <div className="flex items-center gap-6">
        <NotificationDropdown />

        <button
          onClick={() => navigate('/student/profile')}
          className="flex items-center gap-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 p-2 rounded-xl transition-all border border-transparent hover:border-gray-100"
        >
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold uppercase border border-indigo-200">
            {studentName?.charAt(0) || 'S'}
          </div>
          <div className="text-left hidden sm:block">
            <p className="leading-none">{studentName}</p>
            <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-wider">
              View Profile
            </p>
          </div>
        </button>

        <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-500 hover:text-rose-600 transition-colors font-bold text-sm"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
