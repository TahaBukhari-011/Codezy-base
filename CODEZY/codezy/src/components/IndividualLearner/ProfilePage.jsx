import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NotificationDropdown from '../NotificationDropdown';
import { 
  Bell, User, Mail, Calendar, Camera, 
  Edit3, Award, FileText, Download, ExternalLink,
  Trophy, Code, Flame, ChevronLeft, Lock, Shield, ShieldCheck, Save, X, Eye, EyeOff, LogOut
} from 'lucide-react';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("General");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // MFA States
  const [isSettingUpMfa, setIsSettingUpMfa] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [mfaToken, setMfaToken] = useState("");

  // Password Modal States
  const [showPassModal, setShowPassModal] = useState(false);
  const [passData, setPassData] = useState({ currentPassword: "", newPassword: "" });
  const [showPass, setShowPass] = useState(false);

  // Profile Data State
  const [profileData, setProfileData] = useState({
    fullName: localStorage.getItem("fullName") || "Jordan Davis",
    email: "jordan.davis@email.com",
    username: "@jordandavis",
    bio: "Passionate software developer on a journey...",
    mfaEnabled: false
  });

  const userId = localStorage.getItem("userId");

  // 1. Logout Functionality
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      // Clear all items related to the user session
      localStorage.removeItem("userId");
      localStorage.removeItem("fullName");
      localStorage.removeItem("token"); // If you are using JWT tokens
      localStorage.removeItem("role");

      // Redirect to login page
      window.location.href = "/login"; 
    }
  };

  // 2. Fetch Profile Data from Database
  useEffect(() => {
    if (userId) {
      axios.get(`http://localhost:5000/api/learners/profile/${userId}`)
        .then(res => setProfileData(prev => ({ ...prev, ...res.data })))
        .catch(err => console.error("Error fetching profile:", err));
    }
  }, [userId]);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.put(`http://localhost:5000/api/learners/profile/${userId}`, {
        fullName: profileData.fullName,
        email: profileData.email,
        bio: profileData.bio
      });
      setProfileData(res.data);
      localStorage.setItem("fullName", res.data.fullName);
      setIsEditing(false); 
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Frontend Save Error:", err);
      alert(err.response?.data?.message || "Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  // Password Validation Logic
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&()[\]{}#^<>.,;:'"~`+=_-]).{8,}$/;
  const isPasswordValid = passwordRegex.test(passData.newPassword);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/learners/change-password/${userId}`, passData);
      alert("Password changed successfully!");
      setShowPassModal(false);
      setPassData({ currentPassword: "", newPassword: "" });
      setShowPass(false);
    } catch (err) {
      alert(err.response?.data?.message || "Error changing password");
    }
  };

  const handleSetupMFA = async () => {
    try {
      const res = await axios.post(`http://localhost:5000/api/learners/setup-mfa/${userId}`);
      setQrCode(res.data.qrCodeUrl);
      setIsSettingUpMfa(true);
    } catch (err) { alert("Could not initialize MFA setup"); }
  };

  const handleVerifyAndActivateMFA = async () => {
    try {
      await axios.post(`http://localhost:5000/api/learners/verify-mfa/${userId}`, { token: mfaToken });
      setProfileData({ ...profileData, mfaEnabled: true });
      setIsSettingUpMfa(false);
      alert("MFA is now active!");
    } catch (err) { alert("Invalid 6-digit code."); }
  };

  const handleDisableMFA = async () => {
    if (window.confirm("Disabling MFA reduces account security. Continue?")) {
      try {
        await axios.put(`http://localhost:5000/api/learners/disable-mfa/${userId}`);
        setProfileData({ ...profileData, mfaEnabled: false });
      } catch (err) { alert("Error disabling MFA"); }
    }
  };

  const certifications = [
    { id: 1, title: "Full-Stack Web Development", issuer: "Codezy Academy", date: "Dec 2025", image: "/api/placeholder/400/250" },
    { id: 2, title: "Advanced React Patterns", issuer: "Codezy Academy", date: "Nov 2025", image: "/api/placeholder/400/250" }
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans relative">
      {/* --- NAVIGATION --- */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-8">
          <a href="/learner-dashboard" className="text-purple-700 font-bold text-xl flex items-center gap-2">
            <div className="bg-purple-700 text-white px-1.5 py-0.5 rounded-md text-sm font-mono">{"</>"}</div> Codezy
          </a>
          <div className="hidden md:flex gap-2 text-sm font-semibold text-gray-500">
            <a href="/courses" className="hover:text-purple-700 px-4 py-2 transition-colors">Courses</a>
            <a href="/roadmap" className="hover:text-purple-700 px-4 py-2 transition-colors">Roadmap</a>
            <a href="/labs" className="hover:text-purple-700 px-4 py-2 transition-colors">Labs</a>
            <a href="/achievements" className="hover:text-purple-700 px-4 py-2 transition-colors">Achievements</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <NotificationDropdown />
          <div className="h-8 w-[1px] bg-gray-100 mx-1"></div> {/* Divider */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-red-600 font-bold text-xs transition-colors px-3 py-2 rounded-xl hover:bg-red-50"
          >
            <LogOut size={16} /> Logout
          </button>
          <a href="/learner-profile" className="w-9 h-9 rounded-full bg-purple-700 text-white flex items-center justify-center font-bold border-2 border-purple-200">
             {profileData.fullName?.charAt(0)}
          </a>
        </div>
      </nav>

      {/* --- HEADER --- */}
      <div className="bg-gradient-to-r from-[#D91B5C] via-[#7C3AED] to-[#7C3AED] pt-8 pb-20 px-10 text-white shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-end">
          <div>
            <a href="/learner-dashboard" className="flex items-center gap-2 text-xs font-bold opacity-80 hover:opacity-100 mb-6 uppercase tracking-widest">
              <ChevronLeft size={16} /> Back to Dashboard
            </a>
            <h1 className="text-2xl font-black flex items-center gap-3"><User size={28} /> My Profile</h1>
          </div>
          
          {isEditing && (
            <div className="flex gap-3 animate-in slide-in-from-right-4 duration-300">
              <button onClick={() => setIsEditing(false)} className="bg-white/10 hover:bg-white/20 border border-white/30 px-6 py-2.5 rounded-2xl text-xs font-bold transition-all">Cancel</button>
              <button onClick={handleSaveProfile} disabled={loading} className="bg-white text-purple-700 px-6 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all hover:shadow-xl shadow-lg active:scale-95">
                {loading ? <div className="w-4 h-4 border-2 border-purple-700 border-t-transparent rounded-full animate-spin"></div> : <Save size={16}/>}
                SAVE CHANGES
              </button>
            </div>
          )}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-10 -mt-12 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-80 shrink-0">
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl p-8 flex flex-col items-center text-center transition-all hover:shadow-2xl">
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full border-4 border-purple-50 overflow-hidden bg-gray-100 shadow-inner">
                  <img src="/api/placeholder/128/128" alt="Profile" className="w-full h-full object-cover" />
                </div>
                <button className="absolute bottom-0 right-0 bg-pink-600 text-white p-2 rounded-full border-4 border-white hover:scale-110 transition-transform shadow-md">
                  <Camera size={16} />
                </button>
              </div>
              <h2 className="font-black text-xl text-gray-800">{profileData.fullName}</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Learner Account</p>
              <div className="bg-purple-50 text-purple-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase mt-4 border border-purple-100">Level 8 • 3,250 XP</div>
              <div className="w-full mt-8 space-y-3">
                <StatRow icon={<Award className="text-purple-500" />} label="Badges Earned" value="12" />
                <StatRow icon={<Code className="text-blue-500" />} label="Completed Labs" value="42" />
                <StatRow icon={<Flame className="text-orange-500" />} label="Current Streak" value="12 days" />
              </div>
            </div>
          </aside>

          <div className="flex-1 space-y-8">
            <div className="flex gap-2 p-1.5 bg-white rounded-2xl border border-gray-100 shadow-sm w-fit">
              {["General", "Certifications", "Security"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === tab ? 'bg-purple-700 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}>{tab}</button>
              ))}
            </div>

            {activeTab === "General" && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <ProfileSection title="Personal Information" onEdit={() => setIsEditing(true)}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputGroup label="Full Name" value={profileData.fullName} isEditing={isEditing} onChange={(val) => setProfileData({...profileData, fullName: val})} icon={<User size={16} />} />
                    <InputGroup label="Email Address" value={profileData.email} isEditing={isEditing} onChange={(val) => setProfileData({...profileData, email: val})} icon={<Mail size={16} />} />
                  </div>
                </ProfileSection>
                <ProfileSection title="Bio" onEdit={() => setIsEditing(true)}>
                  {isEditing ? (
                    <textarea value={profileData.bio} onChange={(e) => setProfileData({...profileData, bio: e.target.value})} className="w-full p-4 bg-gray-50 border border-purple-100 rounded-2xl text-sm focus:ring-2 focus:ring-purple-200 outline-none min-h-[100px] transition-all" />
                  ) : (
                    <p className="text-sm text-gray-500 leading-relaxed italic">{profileData.bio || "No bio added yet."}</p>
                  )}
                </ProfileSection>
              </div>
            )}

            {activeTab === "Certifications" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                {certifications.map(cert => <CertCard key={cert.id} cert={cert} />)}
              </div>
            )}

            {activeTab === "Security" && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <ProfileSection title="Account Security" hideEdit>
                   <div className="space-y-6">
                      <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100 transition-all hover:bg-white hover:shadow-md">
                        <div className="flex gap-4">
                          <div className="bg-white p-3 rounded-xl shadow-sm text-purple-600"><Lock size={24}/></div>
                          <div><h4 className="font-bold text-gray-800">Change Password</h4><p className="text-xs text-gray-400">Regularly updating your password keeps you safe</p></div>
                        </div>
                        <button onClick={() => setShowPassModal(true)} className="bg-white border border-gray-200 text-gray-700 px-6 py-2 rounded-xl text-xs font-bold hover:bg-gray-100 active:scale-95 transition-all">Update</button>
                      </div>

                      <div className="flex flex-col p-6 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex gap-4">
                            <div className={`p-3 rounded-xl shadow-sm transition-colors ${profileData.mfaEnabled ? 'bg-green-50 text-green-600' : 'bg-white text-gray-400'}`}>
                              {profileData.mfaEnabled ? <ShieldCheck size={24}/> : <Shield size={24}/>}
                            </div>
                            <div><h4 className="font-bold text-gray-800">Two-Factor Authentication (MFA)</h4><p className="text-xs text-gray-400">{profileData.mfaEnabled ? "Account protection is active" : "Enable extra protection"}</p></div>
                          </div>
                          <button onClick={profileData.mfaEnabled ? handleDisableMFA : handleSetupMFA} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${profileData.mfaEnabled ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100' : 'bg-purple-700 text-white hover:bg-purple-800'}`}>{profileData.mfaEnabled ? "Disable MFA" : "Setup MFA"}</button>
                        </div>
                        {isSettingUpMfa && (
                          <div className="mt-8 p-6 bg-white border border-purple-100 rounded-[2rem] text-center animate-in fade-in zoom-in-95 duration-300">
                            <p className="text-sm font-bold text-gray-800 mb-4">Scan QR with Authenticator App</p>
                            <img src={qrCode} alt="QR Code" className="mx-auto w-48 h-48 border-8 border-gray-50 rounded-3xl shadow-sm" />
                            <div className="mt-6 max-w-xs mx-auto">
                              <input type="text" maxLength="6" placeholder="000000" value={mfaToken} onChange={(e) => setMfaToken(e.target.value)} className="w-full px-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 text-center text-2xl font-black tracking-[0.3em] focus:ring-2 focus:ring-purple-200 outline-none transition-all" />
                              <div className="flex gap-3 mt-4">
                                <button onClick={() => setIsSettingUpMfa(false)} className="flex-1 py-3 text-xs font-bold text-gray-400">Cancel</button>
                                <button onClick={handleVerifyAndActivateMFA} className="flex-1 py-3 bg-purple-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-100 hover:bg-purple-800 transition-all">Verify & Activate</button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                   </div>
                </ProfileSection>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- PASSWORD MODAL --- */}
      {showPassModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-purple-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl relative animate-in zoom-in-95 duration-200 text-left">
            <h2 className="text-2xl font-black text-gray-800 mb-2">Update Password</h2>
            <p className="text-gray-400 text-sm mb-8">Ensure your new password is secure.</p>
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <InputGroup label="Current Password" type="password" value={passData.currentPassword} isEditing onChange={(val) => setPassData({...passData, currentPassword: val})} />
              <div className="relative">
                <InputGroup label="New Password" type={showPass ? "text" : "password"} value={passData.newPassword} isEditing onChange={(val) => setPassData({...passData, newPassword: val})} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-10 text-gray-400">{showPass ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowPassModal(false)} className="flex-1 py-4 rounded-2xl bg-gray-50 text-gray-500 font-bold text-sm transition-all hover:bg-gray-100">Cancel</button>
                <button type="submit" disabled={!isPasswordValid} className={`flex-1 py-4 rounded-2xl font-bold text-sm transition-all shadow-lg ${isPasswordValid ? "bg-purple-700 text-white hover:bg-purple-800 shadow-purple-100" : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"}`}>Update Now</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SUB-COMPONENTS ---
const ProfileSection = ({ title, children, onEdit, hideEdit }) => (
  <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 transition-all hover:shadow-md">
    <div className="flex justify-between items-center mb-6">
      <h3 className="font-black text-gray-800 text-sm uppercase tracking-widest">{title}</h3>
      {!hideEdit && <button onClick={onEdit} className="flex items-center gap-2 text-[10px] font-black text-purple-600 bg-purple-50 px-5 py-2 rounded-full hover:bg-purple-100 transition-all"><Edit3 size={12} /> EDIT</button>}
    </div>
    {children}
  </div>
);

const InputGroup = ({ label, value, icon, isEditing, onChange, type="text" }) => (
  <div className="space-y-1.5 w-full">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
      {isEditing ? (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={`w-full ${icon ? 'pl-11' : 'px-6'} py-3.5 bg-white border border-purple-200 rounded-2xl text-sm font-bold text-gray-800 focus:ring-2 focus:ring-purple-200 outline-none transition-all shadow-sm`} />
      ) : (
        <div className={`w-full ${icon ? 'pl-11' : 'px-6'} py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-800 shadow-inner overflow-hidden truncate`}>{value}</div>
      )}
    </div>
  </div>
);

const StatRow = ({ icon, label, value }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
    <div className="flex items-center gap-3"> {icon} <span className="text-[10px] font-black text-gray-400 uppercase">{label}</span></div>
    <span className="text-sm font-black text-gray-800">{value}</span>
  </div>
);

const CertCard = ({ cert }) => (
  <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all">
    <div className="relative h-44 bg-gray-50 overflow-hidden">
      <img src={cert.image} alt="Certificate" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
    </div>
    <div className="p-6 text-left">
      <div className="flex items-center gap-2 mb-2"><FileText size={16} className="text-purple-600" /><span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">{cert.issuer}</span></div>
      <h3 className="font-bold text-gray-800 text-sm leading-tight">{cert.title}</h3>
      <p className="text-[11px] text-gray-400 font-bold mt-2 uppercase tracking-tighter">Issued: {cert.date}</p>
    </div>
  </div>
);

export default ProfilePage;