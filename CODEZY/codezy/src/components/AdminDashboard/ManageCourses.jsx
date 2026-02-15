import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plus, BookOpenCheck, User, Bell, LayoutDashboard, ListChecks, LineChart,
  CreditCard, MessageSquare, UserCog, X, LogOut, Trash2, CheckSquare, Square,
  Award, FileText, Settings, ChevronRight, Hash, Loader2, Edit2, ChevronDown, FlaskConical, Users
} from "lucide-react";

const API_COURSES = "http://localhost:5000/api/courses";
const API_TEACHERS = "http://localhost:5000/api/teachers";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: i => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } })
};

const ManageCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: "", courseCode: "", status: "Active", classes: [] });
  const [activeMenu, setActiveMenu] = useState("Manage Courses");
  const [selectedIds, setSelectedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedCourseId, setExpandedCourseId] = useState(null);

  const token = localStorage.getItem("token");

const authHeaders = {
  headers: {
    Authorization: `Bearer ${token}`
  }
};


  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [tRes, cRes] = await Promise.all([
        axios.get(API_TEACHERS, authHeaders),
        axios.get(API_COURSES, authHeaders)
      ]);
      setTeachers(tRes.data || []);
      setCourses(cRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getTeacherDisplayName = (classObj) => {
    if (classObj.teacher?.name) return classObj.teacher.name;
    const found = teachers.find(t => t._id === (classObj.teacherId || classObj.teacher));
    return found ? found.name : "Unassigned";
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  // --- DELETE LOGIC ---
  const toggleSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleIndividualDelete = async (id) => {
    if (!window.confirm("Delete this course permanently?")) return;
    try {
      await axios.delete(`${API_COURSES}/${id}`, authHeaders);
      setCourses(prev => prev.filter(c => c._id !== id));
      setSelectedIds(prev => prev.filter(i => i !== id));
    } catch (err) {
      alert("Failed to delete course.");
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} selected courses permanently?`)) return;
    try {
      await Promise.all(selectedIds.map(id => axios.delete(`${API_COURSES}/${id}`, authHeaders)));
      setCourses(prev => prev.filter(c => !selectedIds.includes(c._id)));
      setSelectedIds([]);
      alert("Batch deletion successful.");
    } catch (err) {
      alert("Error during bulk delete.");
    }
  };

  const handleSaveCourse = async () => {
    if (!newCourse.title || !newCourse.courseCode) return alert("Required: Name and Code");
    const payload = {
      ...newCourse,
      classes: newCourse.classes.map(cls => ({ ...cls, teacher: cls.teacherId }))
    };
    try {
      if (isEditing) await axios.put(`${API_COURSES}/${editingId}`, payload, authHeaders);
      else await axios.post(API_COURSES, payload, authHeaders);
      fetchData();
      setShowAddCourse(false);
      setIsEditing(false);
      setNewCourse({ title: "", courseCode: "", status: "Active", classes: [] });
    } catch (err) { alert("Error saving updates."); }
  };

  const handleEditClick = (e, course) => {
    e.stopPropagation();
    setNewCourse({
      title: course.title,
      courseCode: course.courseCode,
      status: course.status,
      classes: course.classes.map(cls => ({
        name: cls.name,
        teacherId: cls.teacher?._id || cls.teacher
      }))
    });
    setEditingId(course._id);
    setIsEditing(true);
    setShowAddCourse(true);
  };

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

      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white shadow-sm border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-xl font-black text-slate-800 tracking-tight ml-4 uppercase">Admin Dashboard</h1>
          <div className="flex items-center gap-3 mr-4">
            <button className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600"><Bell size={20} /><span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span></button>
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold uppercase shadow-lg shadow-indigo-200">A</div>
          </div>
        </header>

        <div className="p-8 pb-32">
          <div className="flex justify-between items-center mb-8">
            <div className="text-left">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Manage Courses</h2>
              <p className="text-slate-500 font-medium">Academic staff management and course assignments</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => { setIsEditing(false); setNewCourse({ title: "", courseCode: "", status: "Active", classes: [] }); setShowAddCourse(true); }}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all text-sm uppercase tracking-widest"
            >
              <Plus size={18} /> ADD NEW COURSE
            </motion.button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-indigo-600" size={48} /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course, i) => {
                const totalStudents = course.classes?.reduce((acc, cls) => acc + (cls.students?.length || 0), 0);
                const totalLabs = course.classes?.reduce((acc, cls) => acc + (cls.labs?.length || 0), 0);
                const isSelected = selectedIds.includes(course._id);

                return (
                  <motion.div
                    key={course._id} custom={i} variants={cardVariants} initial="hidden" animate="visible"
                    className={`bg-white rounded-[2rem] border-l-8 border-l-orange-500 overflow-hidden relative group hover:shadow-2xl transition-all duration-300 ${isSelected ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-slate-200'}`}
                  >
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-6">
                        {/* RE-ADDED CHECKBOX */}
                        <button 
                          onClick={() => toggleSelection(course._id)}
                          className={`p-2 rounded-xl transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-300 hover:text-indigo-400'}`}
                        >
                          {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                        </button>
                        
                        <div className="flex gap-2">
                          <button onClick={(e) => handleEditClick(e, course)} className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm"><Edit2 size={16}/></button>
                          <button onClick={() => handleIndividualDelete(course._id)} className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 transition-all shadow-sm"><Trash2 size={16}/></button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 font-black text-lg shadow-inner">{course.title.charAt(0)}</div>
                        <div>
                          <h3 className="text-xl font-black text-slate-800 tracking-tight truncate w-44">{course.title}</h3>
                          <p className="text-orange-600 font-bold text-[10px] flex items-center gap-1 font-mono uppercase tracking-widest"><Hash size={10}/>{course.courseCode}</p>
                        </div>
                      </div>

                      <div className="flex gap-3 mb-6 mt-6">
                        <div className="flex-1 bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
                          <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Students</p>
                          <div className="text-xl font-black text-slate-700 tracking-tight">{totalStudents}</div>
                        </div>
                        <div className="flex-1 bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
                          <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Labs</p>
                          <div className="text-xl font-black text-slate-700 tracking-tight">{totalLabs}</div>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-4">
                        <button onClick={() => setExpandedCourseId(expandedCourseId === course._id ? null : course._id)} className="w-full flex justify-between items-center text-[10px] font-black text-slate-400 hover:text-orange-600 transition-colors uppercase tracking-widest">View Classes ({course.classes?.length || 0}) {expandedCourseId === course._id ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}</button>
                        <AnimatePresence>
                          {expandedCourseId === course._id && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-4 space-y-3">
                              {course.classes?.map((cls, idx) => (
                                <div key={idx} className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col gap-4 relative overflow-hidden">
                                  <div className="absolute top-0 left-0 h-full w-1.5 bg-orange-500"></div>
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <span className="text-xs font-black text-slate-800 block tracking-tight uppercase">{cls.name}</span>
                                      <div className="flex items-center gap-1 text-[9px] font-bold text-indigo-500 uppercase mt-1"><User size={10}/> {getTeacherDisplayName(cls)}</div>
                                    </div>
                                    <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-2xl text-center shadow-sm">
                                      <p className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">Avg. Score</p>
                                      <p className="text-xs font-black text-orange-600">{cls.averageScore || "0.0"}<span className="text-[9px] text-slate-300">/10</span></p>
                                    </div>
                                  </div>
                                  <div className="flex gap-6 border-t border-slate-200/50 pt-2 font-bold text-[10px] uppercase text-slate-500 tracking-tighter">
                                    <div className="flex items-center gap-1.5"><Users size={12} className="text-emerald-500"/> {cls.students?.length || 0} Enrollments</div>
                                    <div className="flex items-center gap-1.5"><FlaskConical size={12} className="text-orange-500"/> {cls.labs?.length || 0} Active Units</div>
                                  </div>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* BULK ACTION BAR */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div 
              initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 shadow-2xl px-8 py-4 rounded-3xl z-50 flex items-center gap-8 border border-slate-700"
            >
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xs">{selectedIds.length}</span>
                <span className="text-white font-black text-[10px] uppercase tracking-widest">Courses Selected</span>
              </div>
              <div className="h-8 w-[1px] bg-slate-700"></div>
              <button 
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.1em] transition-all"
              >
                <Trash2 size={14} /> Delete Batch
              </button>
              <button 
                onClick={() => setSelectedIds([])}
                className="text-slate-400 font-black hover:text-white text-[10px] uppercase tracking-widest transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ADD/EDIT MODAL */}
      <AnimatePresence>
        {showAddCourse && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl max-h-[85vh] overflow-y-auto border-l-[10px] border-orange-500 relative">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{isEditing ? 'Modify Course' : 'New Course'}</h2>
                <button onClick={() => setShowAddCourse(false)} className="bg-slate-100 p-2 rounded-full hover:bg-red-100 hover:text-red-500 transition-all"><X size={20} /></button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Course Name</label>
                        <input type="text" placeholder="E.G. DATA STRUCTURES" className="w-full bg-slate-50 border border-slate-100 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-black text-slate-800 text-sm uppercase tracking-wider" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} />
                    </div>
                    <div className="col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">System Identifier</label>
                        <input type="text" placeholder="E.G. CS-101" className="w-full bg-slate-50 border border-slate-100 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-black text-orange-600 uppercase tracking-widest text-sm" value={newCourse.courseCode} onChange={e => setNewCourse({...newCourse, courseCode: e.target.value})} />
                    </div>
                </div>

                <div className="pt-2">
                  <h3 className="font-black text-slate-800 uppercase text-[11px] mb-4 tracking-widest flex items-center gap-2 border-l-4 border-orange-500 pl-3">Assignments</h3>
                  <div className="space-y-3">
                    {newCourse.classes.map((cls, idx) => (
                      <div key={idx} className="flex flex-col gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 relative group">
                        <button onClick={() => setNewCourse({...newCourse, classes: newCourse.classes.filter((_, i) => i !== idx)})} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors"><X size={16}/></button>
                        <div className="flex gap-2">
                            <input placeholder="CLASS TAG" className="flex-1 bg-white p-3 rounded-lg outline-none text-[11px] font-black uppercase shadow-sm border border-slate-100 focus:border-orange-300 tracking-wider" value={cls.name} onChange={e => {
                                const updated = [...newCourse.classes]; updated[idx].name = e.target.value; setNewCourse({...newCourse, classes: updated});
                            }} />
                            <select className="flex-1 bg-white p-3 rounded-lg outline-none text-[10px] font-black uppercase shadow-sm border border-slate-100 focus:border-orange-300 text-slate-600 appearance-none cursor-pointer" value={cls.teacherId} onChange={e => {
                                const updated = [...newCourse.classes]; updated[idx].teacherId = e.target.value; setNewCourse({...newCourse, classes: updated});
                            }}>
                              <option value="">SELECT FACULTY</option>
                              {teachers.map(t => <option key={t._id} value={t._id}>{t.name.toUpperCase()} — {t.email.toLowerCase()}</option>)}
                            </select>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setNewCourse({...newCourse, classes: [...newCourse.classes, {name:"", teacherId:""}]})} className="mt-4 text-indigo-600 text-[10px] font-black uppercase hover:bg-indigo-50 px-4 py-2 rounded-lg transition-all font-black">+ REGISTER NEW CLASS</button>
                </div>

                <div className="flex justify-center pt-4">
                  <button onClick={handleSaveCourse} className="w-full md:w-3/4 bg-slate-900 text-white py-4 rounded-xl font-black text-xs shadow-xl hover:bg-black transition-all uppercase tracking-widest">
                    {isEditing ? 'COMMIT DATA UPDATES' : 'PUBLISH COURSE'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageCourses;