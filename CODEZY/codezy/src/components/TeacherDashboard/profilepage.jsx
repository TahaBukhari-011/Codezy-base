import React, { useState, useEffect } from 'react';
import { User, Mail, MapPin, Calendar, Edit, Save, Camera, Lock, BookOpen, Award, Settings, Sparkles, Zap, Shield, Bell, Palette, X } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from "framer-motion";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const teacherId = localStorage.getItem("userId");

  // 2FA Specific States
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrData, setQrData] = useState({ url: '', secret: '' });
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);

  // User Data State
  const [userData, setUserData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      office: '',
      joinDate: '',
      bio: ''
    },
    security: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    preferences: {
      theme: 'light',
      language: 'english',
      emailNotifications: true,
      pushNotifications: true,
      weeklyReports: false
    },
    isTwoFactorEnabled: false
  });

  const [profileStats, setProfileStats] = useState([
    { title: 'Courses Taught', value: '0', icon: BookOpen, color: 'text-indigo-600', bgColor: 'bg-indigo-100', change: 'Total' },
    { title: 'Students Mentored', value: '0', icon: User, color: 'text-emerald-600', bgColor: 'bg-emerald-100', change: 'Live' },
    { title: 'Classes Managed', value: '0', icon: Award, color: 'text-cyan-600', bgColor: 'bg-cyan-100', change: 'Total' },
    { title: 'Status', value: 'Active', icon: Calendar, color: 'text-amber-600', bgColor: 'bg-amber-100', change: 'Now' }
  ]);

  const fetchTeacherData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/api/teachers/${teacherId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = response.data;
      const nameParts = (data.name || '').split(' ');

      setUserData(prev => ({
        ...prev,
        isTwoFactorEnabled: data.isTwoFactorEnabled || false,
        personalInfo: {
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: data.email || '',
          phone: data.phone || '',
          department: (data.department && data.department[0]) || '',
          position: data.role || '',
          office: data.office || '',
          bio: data.bio || '',
          joinDate: data.joinDate ? data.joinDate.split('T')[0] : (data.createdAt ? data.createdAt.split('T')[0] : '')
        }
      }));

      // UPDATED LOGIC: Pulling stats from the backend response
      const overviewRes = await axios.get(`http://localhost:5000/api/teachers/${teacherId}/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { courses, students, classes, status } = overviewRes.data;

      setProfileStats([
        { title: 'Courses Taught', value: courses.length, icon: BookOpen, color: 'text-indigo-600', bgColor: 'bg-indigo-100', change: 'Total' },
        { title: 'Students Mentored', value: students.length, icon: User, color: 'text-emerald-600', bgColor: 'bg-emerald-100', change: 'Live' },
        { title: 'Classes Managed', value: classes.length, icon: Award, color: 'text-cyan-600', bgColor: 'bg-cyan-100', change: 'Total' },
        { title: 'Status', value: status || 'Active', icon: Calendar, color: 'text-amber-600', bgColor: 'bg-amber-100', change: 'Now' }
      ]);

    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  useEffect(() => {
    if (teacherId) fetchTeacherData();
    setMounted(true);
  }, [teacherId]);

  const handleInputChange = (section, field, value) => {
    setUserData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        name: `${userData.personalInfo.firstName} ${userData.personalInfo.lastName}`,
        email: userData.personalInfo.email,
        role: userData.personalInfo.position,
        department: [userData.personalInfo.department],
        bio: userData.personalInfo.bio,
        office: userData.personalInfo.office,
        joinDate: userData.personalInfo.joinDate
      };
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/teachers/${teacherId}`, payload, {headers: { Authorization: `Bearer ${token}` }});
      setIsEditing(false);
      alert("Profile updated successfully!");
      fetchTeacherData();
    } catch (err) {
      alert("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    const { currentPassword, newPassword, confirmPassword } = userData.security;
    if (!currentPassword || !newPassword || !confirmPassword) return alert("All fields are required");
    if (newPassword !== confirmPassword) return alert("Passwords do not match");

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/teachers/${teacherId}`, { password: newPassword }, {headers: { Authorization: `Bearer ${token}` }});
      setUserData(prev => ({ ...prev, security: { currentPassword: '', newPassword: '', confirmPassword: '' } }));
      alert("Password updated successfully!");
    } catch (err) {
      alert("Error updating password");
    } finally {
      setIsSaving(false);
    }
  };

  // --- 2FA LOGIC START ---
  const handleEnable2FA = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/teachers/${teacherId}/2fa/setup`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setQrData({ url: res.data.qrCodeUrl, secret: res.data.secret });
      setShow2FAModal(true);
    } catch (err) {
      alert("Could not initialize 2FA setup");
    }
  };

  const verifyAndEnable = async () => {
    if (twoFactorToken.length !== 6) return alert("Enter 6-digit code");
    setIsVerifying2FA(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:5000/api/teachers/${teacherId}/2fa/verify`, { token: twoFactorToken }, {headers: { Authorization: `Bearer ${token}` }});
      alert("2FA is now active!");
      setShow2FAModal(false);
      setTwoFactorToken('');
      fetchTeacherData();
    } catch (err) {
      alert("Invalid 6-digit code.");
    } finally {
      setIsVerifying2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    if (window.confirm("Are you sure you want to disable Two-Factor Authentication? Your account will be less secure.")) {
      try {
        const token = localStorage.getItem("token");
        await axios.post(`http://localhost:5000/api/teachers/${teacherId}/2fa/disable`, {}, {headers: { Authorization: `Bearer ${token}` }});
        alert("2FA has been disabled.");
        fetchTeacherData();
      } catch (err) {
        alert("Failed to disable 2FA. Please try again.");
      }
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setProfileImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("email");
    localStorage.clear();
    window.location.href = '/login';
  };

  const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-indigo-300/20 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${20 + Math.random() * 15}s`
          }}
        />
      ))}
    </div>
  );

  const TabButton = ({ icon: Icon, label, tab, isActive }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`w-full text-left px-6 py-4 rounded-xl transition-all duration-500 transform hover:scale-105 group ${
        isActive ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30' : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center space-x-3">
        <Icon size={20} className={isActive ? 'text-white' : 'group-hover:scale-110'} />
        <span className="font-medium">{label}</span>
        {isActive && <Sparkles size={16} className="animate-pulse" />}
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 relative overflow-hidden">
      <FloatingParticles />
      <div className="absolute top-0 -left-20 w-80 h-80 bg-gradient-to-r from-cyan-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-500/10 rounded-full blur-3xl animate-pulse-slower"></div>

      <nav className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/60 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="text-indigo-600 font-bold text-xl flex items-center transform hover:scale-105 transition-transform duration-300">
                <span className="text-2xl mr-1 animate-pulse">&lt;/&gt;</span>
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Codezy</span>
                <Sparkles className="ml-1 text-yellow-500 animate-spin-slow" size={16} />
              </div>
            </div>
            <div className="hidden md:flex space-x-8">
              {['Dashboard', 'My Courses', 'Create Lab', 'Reports', 'Profile'].map((item) => (
                <a key={item} href={item === 'Dashboard' ? '/teacher' : `/${item.toLowerCase().replace(' ', '')}`} className={`py-5 font-medium ${item === 'Profile' ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}>{item}</a>
              ))}
              <button onClick={handleLogout} className="py-5 font-medium text-gray-600 hover:text-red-600">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="text-center mb-8 transform hover:scale-105 transition-transform duration-500">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Profile Settings</h1>
          <p className="text-gray-600 text-lg animate-pulse">Manage your account information and preferences with style</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20 transform hover:scale-105 transition-all duration-500">
              <div className="text-center mb-6">
                <div className="relative inline-block mb-4 group">
                  <div className="w-28 h-28 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg transform group-hover:scale-110 transition-all duration-500 overflow-hidden">
                    {profileImage ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" /> : 'AA'}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 cursor-pointer group">
                    <Camera size={18} className="text-gray-600 group-hover:text-indigo-600" />
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{userData.personalInfo.firstName || ''} {userData.personalInfo.lastName || ''}</h2>
                <p className="text-gray-600 text-sm mb-1">{userData.personalInfo.position || ''}</p>
                <p className="text-gray-500 text-sm">{userData.personalInfo.department || ''}</p>
              </div>
              <div className="space-y-3">
                <TabButton icon={User} label="Personal Info" tab="personal" isActive={activeTab === 'personal'} />
                <TabButton icon={Lock} label="Security" tab="security" isActive={activeTab === 'security'} />
                <TabButton icon={Settings} label="Preferences" tab="preferences" isActive={activeTab === 'preferences'} />
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20 transform hover:scale-105 transition-all duration-500">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Zap size={20} className="text-yellow-500" />Teaching Overview</h3>
              <div className="space-y-4">
                {profileStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white transform hover:scale-105 transition-all duration-300 group">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${stat.bgColor} transform group-hover:scale-110 transition-transform duration-300`}><stat.icon className={stat.color} size={18} /></div>
                      <div>
                        <p className="text-sm text-gray-600">{stat.title}</p>
                        <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">{stat.change}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {activeTab === 'personal' && (
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 transform transition-all duration-700">
                <div className="px-8 py-6 border-b border-gray-200/50 flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg"><User size={24} className="text-white" /></div>
                    Personal Information
                  </h3>
                  <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} disabled={isSaving} className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 group disabled:opacity-50">
                    {isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : isEditing ? <Save size={20} className="group-hover:animate-bounce" /> : <Edit size={20} className="group-hover:rotate-12 transition-transform" />}
                    <span>{isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}</span>
                  </button>
                </div>
                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {['firstName', 'lastName', 'email', 'department', 'position', 'office', 'joinDate'].map((field) => (
                      <div key={field} className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-3 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                        <input
                          type={field === 'joinDate' ? 'date' : (field === 'email' ? 'email' : 'text')}
                          value={userData.personalInfo[field] || ''}
                          onChange={(e) => handleInputChange('personalInfo', field, e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Bio</label>
                    <textarea
                      rows="4"
                      value={userData.personalInfo.bio || ''}
                      onChange={(e) => handleInputChange('personalInfo', 'bio', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-50 resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 transform transition-all duration-700">
                <div className="px-8 py-6 border-b border-gray-200/50">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3"><Shield size={24} className="text-white" />Security Settings</h3>
                </div>
                <div className="p-8 space-y-8">
                  <div className="space-y-6 max-w-md">
                    {['currentPassword', 'newPassword', 'confirmPassword'].map((field) => (
                      <div key={field}>
                        <label className="block text-sm font-semibold text-gray-700 mb-3 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                        <input type="password" value={userData.security[field] || ''} onChange={(e) => handleInputChange('security', field, e.target.value)} className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500" />
                      </div>
                    ))}
                    <button onClick={handlePasswordChange} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold transform hover:scale-105">Update Password</button>
                  </div>
                  
                  <div className="border-t border-gray-200/50 pt-8 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                      <p className={`text-sm ${userData.isTwoFactorEnabled ? 'text-emerald-600' : 'text-gray-600'}`}>
                        Status: {userData.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                    {userData.isTwoFactorEnabled ? (
                      <button onClick={handleDisable2FA} className="bg-red-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-600 transition-colors">Disable 2FA</button>
                    ) : (
                      <button onClick={handleEnable2FA} className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-600 transition-colors">Enable 2FA</button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 transform transition-all duration-700">
                <div className="px-8 py-6 border-b border-gray-200/50">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3"><Settings size={24} className="text-white" />Preferences</h3>
                </div>
                <div className="p-8 space-y-8">
                  <div className="space-y-6">
                    {[{ key: 'emailNotifications', label: 'Email Notifications' }, { key: 'pushNotifications', label: 'Push Notifications' }, { key: 'weeklyReports', label: 'Weekly Reports' }].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl">
                        <span className="font-medium">{label}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={userData.preferences[key] || false} onChange={(e) => handleInputChange('preferences', key, e.target.checked)} />
                          <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 transition-all duration-300"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2FA Modal */}
      <AnimatePresence>
      {show2FAModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
          >
            <button onClick={() => setShow2FAModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
            <div className="text-center">
              <Shield className="text-indigo-600 mx-auto mb-4" size={48} />
              <h3 className="text-2xl font-bold mb-2">Enable 2FA</h3>
              <p className="text-gray-500 text-sm mb-6">Scan the code below with your Authenticator app</p>
              <div className="bg-gray-100 p-4 rounded-2xl inline-block mb-6">
                {qrData.url ? <img src={qrData.url} alt="QR Code" className="w-48 h-48" /> : <div className="w-48 h-48 flex items-center justify-center">Loading...</div>}
              </div>
              <input type="text" maxLength="6" placeholder="000000" value={twoFactorToken} onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, ''))} className="w-full text-center text-3xl tracking-[0.5em] border-2 rounded-2xl py-4 mb-6 outline-none" />
              <button onClick={verifyAndEnable} disabled={isVerifying2FA || twoFactorToken.length < 6} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all">
                {isVerifying2FA ? 'Verifying...' : 'Activate 2FA'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-float { animation: float 25s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-pulse-slower { animation: pulse-slower 6s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      `}</style>
    </div>
  );
};

export default Profile;