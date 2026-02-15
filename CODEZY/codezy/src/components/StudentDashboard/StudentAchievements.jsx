import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Trophy, Zap, Lock, CheckCircle, 
  Star, Award 
} from 'lucide-react';
import Navbar from './Navbar';

const StudentAchievements = () => {
  const navigate = useNavigate();
  const STUDENT_ID = localStorage.getItem('userId');
  const studentName = localStorage.getItem('fullName') || 'Student';

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (!STUDENT_ID) {
      navigate('/login');
      return;
    }

    const fetchAchievements = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/students/${STUDENT_ID}/achievements`
        );
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching achievements:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAchievements();
  }, [STUDENT_ID, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FD]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD] font-sans pb-20">
      {/* Reused Navbar */}
      <Navbar studentName={studentName} />

      <div className="max-w-7xl mx-auto px-8 py-10">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-gray-900">
            Achievements & XP Progress
          </h1>
          <p className="text-gray-500 font-medium">
            Track your learning journey and unlock badges
          </p>
        </header>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl flex justify-between items-center">
            <div>
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1">
                Total XP Points
              </p>
              <h2 className="text-4xl font-black">
                {data?.totalXp || 0} XP
              </h2>
              <p className="text-indigo-200 text-[10px] mt-4 font-bold flex items-center gap-1">
                <Zap size={12} fill="currentColor" /> +{data?.weeklyXp || 0} XP this week
              </p>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl">
              <Zap size={32} />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
              Current Tier
            </p>
            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
              🥈 {data?.tier || 'Silver'}
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                  Next Tier
                </p>
                <h2 className="text-lg font-black text-gray-800">
                  🥇 Gold
                </h2>
              </div>
              <span className="text-indigo-600 font-black text-sm">
                {data?.nextTierPercent || 0}%
              </span>
            </div>

            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data?.nextTierPercent || 0}%` }}
                className="h-full bg-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
          {['All', 'Programming', 'Object-Oriented', 'Data', 'Database', 'General'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all
              ${filter === tab
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-400 border border-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {(data?.badges || [])
            .filter(b => filter === 'All' || b.category === filter)
            .map((badge, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className={`bg-white rounded-3xl p-6 border flex flex-col items-center text-center
                ${badge.isLocked
                  ? 'border-gray-100 grayscale opacity-70'
                  : 'border-indigo-50 shadow-xl'
                }`}
              >
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6
                  ${badge.isLocked
                    ? 'bg-gray-50 border-2 border-dashed'
                    : 'bg-indigo-600 text-white'
                  }`}
                >
                  {badge.isLocked ? <Lock size={24} /> : <Star size={32} />}
                </div>

                <h3 className="font-black text-gray-900 mb-2">
                  {badge.title}
                </h3>
                <p className="text-[11px] text-gray-400 mb-6">
                  {badge.description}
                </p>

                {!badge.isLocked ? (
                  <div className="mt-auto w-full">
                    <div className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase py-1.5 rounded-lg flex justify-center gap-1 mb-4">
                      <CheckCircle size={12} /> Earned
                    </div>
                    <p className="text-[10px] font-bold text-indigo-500 uppercase">
                      +{badge.xpAward} XP
                    </p>
                  </div>
                ) : (
                  <div className="mt-auto w-full">
                    <div className="bg-gray-100 text-gray-400 text-[10px] font-black uppercase py-1.5 rounded-lg mb-4">
                      Locked
                    </div>
                    <div className="w-full bg-gray-50 h-1.5 rounded-full">
                      <div
                        className="bg-gray-300 h-full"
                        style={{ width: `${badge.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default StudentAchievements;
