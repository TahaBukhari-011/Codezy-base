import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, BookOpen, CheckCircle, Clock, 
  ShieldCheck, QrCode, Lock, Trash2 
} from 'lucide-react';
import Navbar from '../StudentDashboard/Navbar'; // Import the shared Navbar

const StudentProfile = () => {
  const navigate = useNavigate();
  const STUDENT_ID = localStorage.getItem('userId');
  const studentName = localStorage.getItem('fullName') || 'Student';

  const [isLoading, setIsLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);

  // MFA States
  const [mfaStep, setMfaStep] = useState('initial');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [mfaToken, setMfaToken] = useState('');

  // Password State
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });

  useEffect(() => {
    if (!STUDENT_ID) { navigate('/login'); return; }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/students/${STUDENT_ID}/profile`);
        const data = await response.json();
        setStudentData(data);
        setMfaStep(data.mfaEnabled ? 'enabled' : 'initial');
        setIsLoading(false);
      } catch (error) {
        console.error("Profile fetch error:", error);
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [STUDENT_ID, navigate]);

  // --- PASSWORD CHANGE LOGIC ---
  const handlePasswordChange = async () => {
    const { currentPassword, newPassword } = passwordData;

    if (!currentPassword || !newPassword) return alert("Please fill both password fields");

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return alert("Password must be at least 8 characters, contain 1 uppercase, 1 digit, and 1 special character.");
    }

    try {
      const res = await fetch(`http://localhost:5000/api/students/${STUDENT_ID}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordData)
      });
      const result = await res.json();
      if (res.ok) {
        alert("Password changed successfully!");
        setPasswordData({ currentPassword: '', newPassword: '' }); 
      } else {
        alert(result.message);
      }
    } catch {
      alert("Failed to update password. Check your connection.");
    }
  };

  // --- MFA HANDLERS ---
  const handleStartMfaSetup = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/students/${STUDENT_ID}/mfa/setup`);
      const data = await res.json();
      setQrCodeUrl(data.qrCodeUrl);
      setMfaStep('setup');
    } catch {
      alert("Failed to start MFA setup");
    }
  };

  const handleVerifyMfa = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/students/${STUDENT_ID}/mfa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: mfaToken.trim() }) 
      });
      const result = await res.json();
      if (res.ok) {
        setMfaStep('enabled');
        alert("MFA successfully enabled!");
      } else {
        alert(result.message || "Invalid Code");
      }
    } catch (err) {
      console.error("MFA Error:", err);
    }
  };

  const handleDisableMfa = async () => {
    if (!window.confirm("Are you sure you want to disable MFA?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/students/${STUDENT_ID}/mfa/disable`, { method: 'POST' });
      if (res.ok) {
        setMfaStep('initial');
        setQrCodeUrl('');
        setMfaToken('');
        alert("MFA has been disabled.");
      }
    } catch (err) {
      console.error("Disable MFA Error:", err);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FD]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FD] font-sans pb-20">
      {/* ✅ Shared Navbar */}
      <Navbar studentName={studentName} />

      <div className="max-w-7xl mx-auto px-8 py-10">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-gray-900">My Profile</h1>
          <p className="text-gray-500 font-medium">Manage your security and account preferences</p>
        </header>

        <div className="grid grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
              <div className="w-32 h-32 bg-indigo-50 rounded-full mx-auto flex items-center justify-center text-indigo-600 text-4xl font-black mb-4 border-4 border-white shadow-xl">
                {studentData?.name?.charAt(0)}
              </div>
              <h2 className="text-xl font-black text-gray-900">{studentData?.name}</h2>
              <p className="text-sm text-gray-500 font-medium">{studentData?.email}</p>
              <p className="text-xs text-indigo-500 font-bold mt-1 tracking-widest uppercase">{studentData?.rollNumber}</p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-6 border-b border-gray-50 pb-4">Academic Progress</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><BookOpen size={20}/></div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Enrolled Courses</p>
                        <p className="text-lg font-black text-gray-800">{studentData?.stats?.enrolledCourses || 0}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-2xl"><CheckCircle size={20}/></div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Completed Labs</p>
                        <p className="text-lg font-black text-gray-800">{studentData?.stats?.completedLabs || 0}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-50 text-yellow-600 rounded-2xl"><Clock size={20}/></div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Pending Labs</p>
                        <p className="text-lg font-black text-gray-800">{studentData?.stats?.pendingLabs || 0}</p>
                    </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            
            {/* Identity Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                <User size={18} className="text-indigo-600" /> Account Identity
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-80">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase ml-1">Official Name</p>
                  <p className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700">{studentData?.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase ml-1">Roll Number</p>
                  <p className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700">{studentData?.rollNumber}</p>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase ml-1">Email Address</p>
                  <p className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700">{studentData?.email}</p>
                </div>
              </div>
            </div>

            {/* MFA Section */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 overflow-hidden relative">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={18} className="text-indigo-600" /> Multi-Factor Authentication
                </h3>
                {mfaStep === 'enabled' && (
                  <button onClick={handleDisableMfa} className="flex items-center gap-1.5 text-rose-500 text-[10px] font-black uppercase bg-rose-50 px-3 py-1.5 rounded-lg hover:bg-rose-100 transition">
                    <Trash2 size={12} /> Disable
                  </button>
                )}
              </div>
              <AnimatePresence mode="wait">
                {mfaStep === 'initial' && (
                  <motion.div key="initial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-4 text-center">
                    <p className="text-sm text-gray-500 mb-6 max-w-md">Require a secure code from your Authenticator app during every login.</p>
                    <button onClick={handleStartMfaSetup} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition flex items-center gap-2">
                      <QrCode size={16} /> Setup Authenticator
                    </button>
                  </motion.div>
                )}
                {mfaStep === 'setup' && (
                  <motion.div key="setup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col md:flex-row items-center gap-10">
                    <div className="p-4 bg-white border-2 border-dashed border-indigo-100 rounded-3xl shadow-inner">
                      <img src={qrCodeUrl} alt="MFA QR" className="w-40 h-40" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <p className="text-xs font-bold text-gray-400 uppercase leading-relaxed">1. Scan QR in app<br/>2. Enter 6-digit code</p>
                      <div className="flex gap-3">
                        <input type="text" maxLength="6" placeholder="000000" value={mfaToken} onChange={(e) => setMfaToken(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-center text-lg font-black tracking-[0.5em] outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button onClick={handleVerifyMfa} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition">Verify</button>
                      </div>
                      <button onClick={() => setMfaStep('initial')} className="text-[10px] font-bold text-gray-400 uppercase underline">Cancel</button>
                    </div>
                  </motion.div>
                )}
                {mfaStep === 'enabled' && (
                  <motion.div key="enabled" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-4 py-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <CheckCircle className="text-emerald-500" size={28} />
                    <div className="flex flex-col">
                        <span className="font-black text-emerald-700 text-sm uppercase tracking-widest">MFA is Protected</span>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Authenticator app is linked</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Password Security Section */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                <Lock size={18} className="text-indigo-600" /> Security
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input 
                  type="password" 
                  placeholder="Current Password" 
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
                <input 
                  type="password" 
                  placeholder="New Password" 
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>
              <div className="mt-4 flex flex-col items-end gap-4">
                <p className="text-[10px] text-gray-400 font-bold uppercase text-right leading-relaxed">
                  Min 8 characters • At least 1 Uppercase Letter<br/>
                  At least 1 Digit • 1 Special Symbol (@, #, $, etc.)
                </p>
                <button 
                  onClick={handlePasswordChange}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 active:scale-95"
                >
                  Update Password
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
