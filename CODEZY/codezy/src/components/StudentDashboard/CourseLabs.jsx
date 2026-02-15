import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronLeft,
  TrendingUp,
  PlayCircle
} from "lucide-react";
import Navbar from '../StudentDashboard/Navbar'; // Shared Navbar Component

const CourseLabs = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const studentId = localStorage.getItem("userId");
  const studentName = localStorage.getItem('fullName') || 'Student';

  const [activeLabs, setActiveLabs] = useState([]);
  const [historyLabs, setHistoryLabs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/students/${studentId}/courses/${courseId}/labs`)
      .then((res) => res.json())
      .then((data) => {
        setActiveLabs(data.active || []);
        setHistoryLabs(data.history || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching labs:", err);
        setIsLoading(false);
      });
  }, [courseId, studentId]);

  const allLabs = [...activeLabs, ...historyLabs];

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FD]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FD] font-sans pb-12">
      {/* ✅ Shared Navbar */}
      <Navbar studentName={studentName} />

      <div className="max-w-7xl mx-auto px-8 py-10">
        <header className="mb-10 flex flex-col gap-4">
          <button 
            onClick={() => navigate('/student/courses')} 
            className="flex items-center gap-2 text-indigo-600 font-bold text-sm"
          >
            <ChevronLeft size={18} /> Back to Courses
          </button>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Course Assignments</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allLabs.map((lab) => {
            const isDone = lab.status === 'Completed' || lab.status === 'Submitted';
            const isLate = lab.status === 'Late Submitted';

            return (
              <motion.div
                key={lab._id}
                whileHover={{ y: -5 }}
                className={`bg-white rounded-3xl p-7 shadow-sm border transition-all ${
                  isDone ? 'border-blue-100' : isLate ? 'border-red-100' : 'border-amber-100'
                }`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{lab.title}</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{lab.courseCode || 'Assignment'}</p>
                  </div>
                  <div className="mt-1">
                    {isDone ? <CheckCircle2 className="text-blue-500" size={24} /> : 
                     isLate ? <AlertCircle className="text-red-500" size={24} /> : 
                     <Clock className="text-amber-500" size={24} />}
                  </div>
                </div>

                <div className="space-y-4 text-sm border-b border-gray-50 pb-6 mb-6">
                  <div className="flex justify-between items-center text-gray-500">
                    <span className="font-bold uppercase text-[11px] tracking-wider">Total Tasks</span>
                    <span className="font-black text-gray-800">{lab.tasks?.length || 0}</span>
                  </div>
                  {(isDone || isLate) && (
                    <div className="flex justify-between items-center text-gray-500">
                      <span className="font-bold uppercase text-[11px] tracking-wider">Your Score</span>
                      <span className="font-black text-gray-900">{lab.score || '0'}/{lab.marks || '100'}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <div className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest ${
                    isDone ? 'text-blue-600' : isLate ? 'text-red-600' : 'text-amber-600'
                  }`}>
                    {isDone ? (
                      <><CheckCircle2 size={14} /> Submitted: {new Date(lab.submittedAt || Date.now()).toLocaleDateString()}</>
                    ) : isLate ? (
                      <><AlertCircle size={14} /> Submitted Late: {new Date(lab.submittedAt || Date.now()).toLocaleDateString()}</>
                    ) : (
                      <><Clock size={14} /> Due: {new Date(lab.dueDate).toLocaleDateString()}</>
                    )}
                  </div>

                  {(!isDone && !isLate) ? (
                    <button 
                      onClick={() => navigate(`/lab-session/${lab._id}`)}
                      className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                    >
                      <PlayCircle size={18} /> Attempt Lab
                    </button>
                  ) : (
                    <div className={`flex items-center gap-2 font-black text-[11px] uppercase tracking-widest w-fit px-3 py-1.5 rounded-xl ${
                        isDone ? 'text-blue-600 bg-blue-50' : 'text-red-600 bg-red-50'
                    }`}>
                      <TrendingUp size={14} /> Performance: {lab.performance || '100'}%
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CourseLabs;
