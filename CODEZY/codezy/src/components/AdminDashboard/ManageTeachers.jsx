import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plus, Edit2, Trash2, User, Loader2, Filter,
  LogOut, Bell, LayoutDashboard, ListChecks, BookOpenCheck, LineChart,
  CreditCard, MessageSquare, UserCog, X, ChevronDown, Mail, Briefcase, 
  Award, FileText, Settings, Eye, CheckSquare, Square, UploadCloud, ToggleLeft, ToggleRight
} from "lucide-react";

const API_URL = "http://localhost:5000/api/teachers";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: i => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.5 } })
};

const defaultTeacher = {
  name: '', email: '', role: '', status: 'Active',
  departmentStr: '', password: ''
};

const ManageTeachers = () => {
  const navigate = useNavigate();

  // State
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [modalTab, setModalTab] = useState('manual');
  const [CSVFile, setCSVFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ ...defaultTeacher });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [activeMenu, setActiveMenu] = useState('Manage Teachers');
  const [isEditing, setIsEditing] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  // --- Helper to get JWT header ---
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token'); // JWT stored in localStorage
    return { Authorization: `Bearer ${token}` };
  };

  // --- FETCH TEACHERS ---
  const fetchTeachers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(API_URL, { headers: getAuthHeaders() });
      setTeachers(res.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

  // --- LOGOUT ---
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  // --- SELECTION ---
  const toggleSelection = (e, id) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredTeachers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTeachers.map(t => t._id));
    }
  };

  // --- CSV UPLOAD ---
  const handleCSVUpload = async () => {
    if (!CSVFile) return alert("Please select a CSV file first.");
    const formData = new FormData();
    formData.append("file", CSVFile);
    setIsUploading(true);
    try {
      const res = await axios.post(`${API_URL}/bulk`, formData, {
        headers: { ...getAuthHeaders(), "Content-Type": "multipart/form-data" }
      });
      alert(res.data.message || "Batch upload successful!");
      setCSVFile(null);
      setShowAddModal(false);
      fetchTeachers();
    } catch (err) {
      console.error("Upload error:", err);
      alert(err.response?.data?.message || "Bulk upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  // --- SAVE TEACHER (CREATE / EDIT) ---
  const handleSaveTeacher = async () => {
    if (!newTeacher.name || !newTeacher.email || !newTeacher.role) {
      return alert("Required: Name, Email, Role");
    }
    const payload = {
      ...newTeacher,
      department: typeof newTeacher.departmentStr === 'string' 
        ? newTeacher.departmentStr.split(',').map(s => s.trim()).filter(Boolean) 
        : [],
    };
    try {
      if (isEditing) {
        await axios.put(`${API_URL}/${editingTeacherId}`, payload, { headers: getAuthHeaders() });
      } else {
        await axios.post(API_URL, payload, { headers: getAuthHeaders() });
      }
      fetchTeachers();
      setShowAddModal(false);
      setNewTeacher({ ...defaultTeacher });
    } catch (err) {
      alert("Error saving teacher to database");
    }
  };

  // --- DELETE TEACHERS ---
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} selected teachers permanently?`)) return;
    try {
      await Promise.all(selectedIds.map(id => axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders() })));
      setTeachers(prev => prev.filter(t => !selectedIds.includes(t._id)));
      setSelectedIds([]);
      alert("Batch deletion successful");
    } catch (err) {
      alert("Error during bulk delete");
    }
  };

  const handleDeleteTeacher = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this teacher permanently?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders() });
      setTeachers(prev => prev.filter(t => t._id !== id));
      setSelectedIds(prev => prev.filter(i => i !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  // --- EDIT / VIEW ---
  const handleEditTeacher = (e, t) => {
    e.stopPropagation();
    setNewTeacher({
      ...t,
      departmentStr: t.department?.join(', ') || '',
      password: ''
    });
    setEditingTeacherId(t._id);
    setIsEditing(true);
    setModalTab('manual');
    setShowAddModal(true);
  };

  const handleViewTeacher = (t) => {
    if (selectedIds.length > 0) return;
    setSelectedTeacher(t);
    setShowViewModal(true);
  };

  // --- SIDEBAR ---
  const sidebarItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { label: 'Manage Teachers', icon: ListChecks, path: '/admin/teachers' },
    { label: 'Manage Courses', icon: BookOpenCheck, path: '/admin/courses' },
    { label: 'Reports', icon: FileText, path: '/admin/reports' },
    { label: 'Competitions', icon: Award, path: '/admin/competitions' },
    { label: 'View Progress', icon: LineChart, path: '/admin/progress' },
    { label: 'Billing', icon: CreditCard, path: '/admin/billing' },
    { label: 'Feedback', icon: MessageSquare, path: '/admin/feedback' },
    { label: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  // --- FILTERED TEACHERS ---
  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl overflow-y-auto">
        <div className="p-8 border-b border-slate-800">
          <h1 className="text-2xl font-black tracking-tight text-indigo-400 uppercase">CODEZY</h1>
        </div>
        <nav className="flex-1 px-4 py-8 space-y-2">
          {sidebarItems.map(item => (
            <button
              key={item.label}
              onClick={() => { setActiveMenu(item.label); navigate(item.path); }}
              className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all duration-200 ${
                activeMenu === item.label ? 'bg-indigo-600 shadow-lg font-black text-white' : 'hover:bg-slate-800 text-slate-400 font-bold'
              }`}
            >
              <item.icon size={18} />
              <span className="text-[10px] uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} className="m-6 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-4 rounded-2xl flex items-center justify-center font-bold transition-all text-xs uppercase tracking-widest">
          <LogOut size={18} className="mr-2" /> Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white shadow-sm border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight ml-4 uppercase">Admin Dashboard</h1>
          <div className="flex items-center gap-3 mr-4">
            <button className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600"><Bell size={20} /><span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span></button>
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold uppercase shadow-lg shadow-indigo-200">A</div>
          </div>
        </header>

        <div className="p-8 pb-32">
          {/* HEADER */}
          <div className="flex justify-between items-center mb-8">
            <div className="text-left">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Manage Teachers</h2>
              <p className="text-slate-500 font-medium">Directory of faculty members and profile control</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => { setIsEditing(false); setNewTeacher({...defaultTeacher}); setShowAddModal(true); }}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all text-sm uppercase tracking-widest"
            >
              <Plus size={18} /> ADD NEW TEACHER
            </motion.button>
          </div>

          {/* SEARCH + FILTER + SELECT ALL */}
          <div className="flex flex-wrap gap-4 mb-8 items-center">
            <button 
                onClick={handleSelectAll}
                className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-3 rounded-2xl hover:bg-slate-50 transition-all group"
            >
                {selectedIds.length > 0 && selectedIds.length === filteredTeachers.length ? (
                    <CheckSquare size={20} className="text-indigo-600" />
                ) : (
                    <Square size={20} className="text-slate-300 group-hover:text-indigo-400" />
                )}
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Select All</span>
            </button>

            <input 
              type="text" placeholder="Search by name or email..." 
              className="flex-1 min-w-[300px] bg-white border border-slate-200 px-6 py-3 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            />
            <select 
              className="bg-white border border-slate-200 px-6 py-3 rounded-2xl outline-none font-bold text-slate-600 cursor-pointer"
              value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>

          {/* TEACHER CARDS */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-indigo-600" size={48} /></div>
          ) : (
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTeachers.map((t, i) => {
                const isSelected = selectedIds.includes(t._id);
                return (
                  <motion.div
                    key={t._id} custom={i} variants={cardVariants} initial="hidden" animate="visible"
                    onClick={() => handleViewTeacher(t)}
                    className={`bg-white rounded-[2rem] border overflow-hidden relative group hover:shadow-2xl transition-all duration-300 cursor-pointer border-l-8 ${t.status === 'Active' ? 'border-l-emerald-500' : 'border-l-orange-500'} ${isSelected ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-slate-200'}`}
                  >
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-6">
                        <button 
                          onClick={(e) => toggleSelection(e, t._id)}
                          className={`p-2 rounded-xl transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-300 hover:text-indigo-400'}`}
                        >
                          {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                        </button>
                        <div className="flex gap-2">
                          <button onClick={(e) => handleEditTeacher(e, t)} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-colors shadow-sm"><Edit2 size={16} /></button>
                          <button onClick={(e) => handleDeleteTeacher(e, t._id)} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-colors shadow-sm"><Trash2 size={16} /></button>
                        </div>
                      </div>

                      <div className="flex items-center gap-5 mb-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner uppercase ${t.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                          {t.name?.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-800 tracking-tight">{t.name}</h3>
                          <span className={`text-[10px] uppercase tracking-widest font-black px-2 py-1 rounded-lg ${t.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>{t.status}</span>
                        </div>
                      </div>

                      <div className="space-y-3 mb-8 text-slate-500 text-sm font-medium">
                        <div className="flex items-center truncate"><Mail size={16} className="mr-3 text-indigo-400 flex-shrink-0" /> {t.email}</div>
                        <div className="flex items-center"><Briefcase size={16} className="mr-3 text-indigo-400 flex-shrink-0" /> {t.role}</div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-center font-black">
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100"><div className="text-[9px] text-slate-400 uppercase mb-1">Courses</div><div className="text-lg text-slate-700">{t.courses?.length || 0}</div></div>
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100"><div className="text-[9px] text-slate-400 uppercase mb-1">Classes</div><div className="text-lg text-slate-700">{t.classes?.length || 0}</div></div>
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100"><div className="text-[9px] text-slate-400 uppercase mb-1">Students</div><div className="text-lg text-slate-700">{t.students || 0}</div></div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* BULK ACTION BAR */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 shadow-2xl px-8 py-4 rounded-3xl z-50 flex items-center gap-8 border border-slate-700">
              <div className="flex items-center gap-2"><span className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xs">{selectedIds.length}</span><span className="text-white font-black text-[10px] uppercase tracking-widest">Selected</span></div>
              <button onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all"><Trash2 size={14} /> DELETE BATCH</button>
              <button onClick={() => setSelectedIds([])} className="text-slate-400 font-black hover:text-white text-[10px] uppercase tracking-widest transition-colors">CANCEL</button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ADD/EDIT MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl max-h-[85vh] overflow-y-auto border-l-[10px] border-indigo-600 relative">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{isEditing ? 'Modify Profile' : 'Add Teacher'}</h2>
                <button onClick={() => { setShowAddModal(false); setCSVFile(null); }} className="bg-slate-100 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all"><X size={20} /></button>
              </div>

              <div className="flex gap-3 mb-6 bg-slate-100 p-1 rounded-xl">
                <button className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${modalTab === 'manual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`} onClick={() => setModalTab('manual')}>MANUAL ENTRY</button>
                {!isEditing && (
                   <button className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${modalTab === 'csv' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`} onClick={() => setModalTab('csv')}>CSV UPLOAD</button>
                )}
              </div>

              {modalTab === 'manual' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block ml-1">Full Name</label>
                      <input type="text" className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium" value={newTeacher.name} onChange={e => setNewTeacher({...newTeacher, name: e.target.value})} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block ml-1">Email Address</label>
                      <input type="email" className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium" value={newTeacher.email} onChange={e => setNewTeacher({...newTeacher, email: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block ml-1">Role</label>
                      <input type="text" className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium" value={newTeacher.role} onChange={e => setNewTeacher({...newTeacher, role: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block ml-1">Status</label>
                      <select 
                        className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold text-slate-600 cursor-pointer"
                        value={newTeacher.status}
                        onChange={e => setNewTeacher({...newTeacher, status: e.target.value})}
                      >
                        <option value="Active">Active</option>
                        <option value="On Leave">On Leave</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-center pt-4">
                    <button onClick={handleSaveTeacher} className="w-2/3 bg-slate-900 text-white py-4 rounded-xl font-bold text-xs shadow-xl hover:bg-black transition-all uppercase tracking-[0.2em]">
                      {isEditing ? 'Commit Updates' : 'Create Teacher'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50">
                    <input type="file" id="csv" hidden accept=".csv" onChange={e => setCSVFile(e.target.files[0])} />
                    <label htmlFor="csv" className="cursor-pointer group">
                      <div className="bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                        <UploadCloud size={24} />
                      </div>
                      <p className="font-bold text-slate-800 text-sm">{CSVFile ? CSVFile.name : 'Click to select CSV File'}</p>
                      <p className="text-slate-400 text-[10px] mt-1 uppercase tracking-widest">Required: Name, Email, Role</p>
                    </label>
                  </div>
                  
                  <div className="flex justify-center">
                    <button 
                      onClick={handleCSVUpload}
                      disabled={!CSVFile || isUploading}
                      className={`w-2/3 py-4 rounded-xl font-bold text-xs shadow-xl transition-all uppercase tracking-widest flex items-center justify-center gap-2 ${
                        !CSVFile ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {isUploading ? (
                        <><Loader2 size={16} className="animate-spin" /> UPLOADING...</>
                      ) : (
                        <>START BATCH IMPORT</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageTeachers;
