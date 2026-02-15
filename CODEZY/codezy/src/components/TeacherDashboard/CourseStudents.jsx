import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Search, PlusCircle, Upload, X, Trash2, Edit2, CheckSquare, Square } from 'lucide-react';
import Papa from 'papaparse';
import { useParams } from 'react-router-dom';

const CourseStudents = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [course, setCourse] = useState(null);
    const [classId, setClassId] = useState(null);
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const [manualStudent, setManualStudent] = useState({
        name: '', rollNumber: '', email: '', password: '', xp: 0, progress: 0
    });
    const [editIndex, setEditIndex] = useState(null);
    const { courseId, classId: routeClassId } = useParams();

    // --- Fetch Courses on Mount ---
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get('http://localhost:5000/api/courses', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const allCourses = res.data;
                setCourses(allCourses);

                if (allCourses.length > 0) {
                    const selectedCourse = allCourses.find(c => c._id === courseId) || allCourses[0];
                    setCourse(selectedCourse);
                    const clsId = routeClassId || selectedCourse.classes?.[0]?._id;
                    setClassId(clsId);
                    if (selectedCourse._id && clsId) fetchStudents(selectedCourse._id, clsId);
                }
            } catch (err) {
                console.error('Error loading courses:', err);
            }
        };
        fetchInitialData();
    }, [courseId, routeClassId]);

    // --- Fetch Students ---
    const fetchStudents = async (cId, clsId) => {
        if (!cId || !clsId) return;
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(
                `http://localhost:5000/api/courses/${cId}/classes/${clsId}/students`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStudents(res.data);
            setSelectedStudentIds([]);
        } catch (err) {
            console.error('Error fetching students:', err);
            setStudents([]);
        }
    };

    const handleCourseChange = (selectedId) => {
        const selectedCourse = courses.find(c => c._id === selectedId);
        if (!selectedCourse) return;
        setCourse(selectedCourse);
        if (selectedCourse.classes?.length > 0) {
            const firstClsId = selectedCourse.classes[0]._id;
            setClassId(firstClsId);
            fetchStudents(selectedCourse._id, firstClsId);
        } else {
            setClassId(null);
            setStudents([]);
        }
    };

    const handleClassChange = (id) => {
        setClassId(id);
        fetchStudents(course._id, id);
    };

    // --- Checkbox logic ---
    const toggleSelectAll = () => {
        if (selectedStudentIds.length === filteredStudents.length) {
            setSelectedStudentIds([]);
        } else {
            setSelectedStudentIds(filteredStudents.map(s => s._id));
        }
    };
    const toggleSelectStudent = (id) => {
        setSelectedStudentIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // --- Bulk Delete ---
    const handleBulkDelete = async () => {
        if (selectedStudentIds.length === 0) return;
        if (!window.confirm(`Delete ${selectedStudentIds.length} selected students?`)) return;
        try {
            const token = localStorage.getItem("token");
            await Promise.all(
                selectedStudentIds.map(id =>
                    axios.delete(
                        `http://localhost:5000/api/courses/${course._id}/classes/${classId}/students/${id}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    )
                )
            );
            fetchStudents(course._id, classId);
            setSelectedStudentIds([]);
            alert("Selected students deleted successfully.");
        } catch (err) {
            console.error('Bulk delete error:', err);
            alert("Error during bulk deletion.");
        }
    };

    // --- CSV Upload ---
    const handleCSVUpload = (event) => {
        const file = event.target.files[0];
        if (!file || !classId || !course) return;
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const parsedStudents = results.data.map(row => ({
                    name: row.name?.trim() || '',
                    rollNumber: row.rollNumber?.trim() || '',
                    email: row.email?.trim() || '',
                    password: row.password?.trim() || '123456',
                    xp: Number(row.xp) || 0,
                    progress: Number(row.progress) || 0,
                }));
                try {
                    const token = localStorage.getItem("token");
                    await axios.post(
                        `http://localhost:5000/api/courses/${course._id}/classes/${classId}/students`,
                        { students: parsedStudents },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    fetchStudents(course._id, classId);
                } catch (err) {
                    console.error(err);
                }
                setShowModal(false);
            },
            error: (err) => {
                console.error("CSV parse error:", err);
            }
        });
    };

    // --- Add or Edit Single Student ---
    const handleAddOrEditStudent = async () => {
        if (!manualStudent.name || !manualStudent.rollNumber || !classId || !course) return;
        try {
            const token = localStorage.getItem("token");
            if (editIndex !== null) {
                await axios.put(
                    `http://localhost:5000/api/courses/${course._id}/classes/${classId}/students/${students[editIndex]._id}`,
                    manualStudent,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await axios.post(
                    `http://localhost:5000/api/courses/${course._id}/classes/${classId}/students`,
                    { students: [manualStudent] },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            fetchStudents(course._id, classId);
            setEditIndex(null);
            setManualStudent({ name: '', rollNumber: '', email: '', password: '', xp: 0, progress: 0 });
            setShowModal(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteStudent = async (index) => {
        if (!window.confirm(`Delete ${students[index].name}?`)) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(
                `http://localhost:5000/api/courses/${course._id}/classes/${classId}/students/${students[index]._id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchStudents(course._id, classId);
        } catch (err) {
            console.error(err);
        }
    };

    const handleEditStudent = (index) => {
        setManualStudent({ ...students[index] });
        setEditIndex(index);
        setShowModal(true);
    };

    const filteredStudents = students.filter(s => {
        if (!s || typeof s !== 'object') return false;
        const name = s.name || "";
        const roll = s.rollNumber || "";
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               roll.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (courses.length === 0 && !course) {
        return (
            <div className="min-h-screen flex items-center justify-center flex-col gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                <p className="text-gray-500 font-medium">Loading Course Data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans p-4 sm:p-8">
            <button onClick={() => navigate('/teacher')} className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4 text-sm font-bold">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h1 className="text-4xl font-extrabold text-gray-900">{course?.title || "Manage Students"}</h1>
                
                <div className="flex flex-wrap gap-4">
                    <div className="flex flex-col">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Course</label>
                        <select
                            value={course?._id || ''}
                            onChange={(e) => handleCourseChange(e.target.value)}
                            className="border-2 border-gray-200 px-4 py-2 rounded-xl bg-white font-bold text-gray-700 outline-none focus:border-indigo-500 transition-all"
                        >
                            {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Class</label>
                        <select
                            value={classId || ''}
                            onChange={(e) => handleClassChange(e.target.value)}
                            className="border-2 border-gray-200 px-4 py-2 rounded-xl bg-white font-bold text-gray-700 outline-none focus:border-indigo-500 transition-all"
                        >
                            {course?.classes?.map(cls => <option key={cls._id} value={cls._id}>{cls.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* --- Students Table --- */}
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-gray-800">Enrolled Students ({students.length})</h2>
                        {selectedStudentIds.length > 0 && (
                            <button 
                                onClick={handleBulkDelete}
                                className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white font-bold py-1.5 px-4 rounded-lg transition-all animate-in fade-in slide-in-from-left-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete Selected ({selectedStudentIds.length})</span>
                            </button>
                        )}
                    </div>
                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-indigo-100">
                        <PlusCircle className="w-5 h-5" /> <span>Manage List</span>
                    </button>
                </div>

                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or roll number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 text-gray-900 rounded-2xl border-2 border-gray-100 focus:border-indigo-500 outline-none transition-all"
                    />
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-100">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase font-black tracking-widest">
                            <tr>
                                <th className="px-6 py-4 w-10">
                                    <button onClick={toggleSelectAll} className="text-indigo-600">
                                        {selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0 ? 
                                            <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />
                                        }
                                    </button>
                                </th>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Roll Number</th>
                                <th className="px-6 py-4">XP Points</th>
                                <th className="px-6 py-4">Progress</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 font-medium">
                            {students.length === 0 ? (
                                <tr><td colSpan="6" className="py-12 text-center text-gray-400 italic">No students found in this class.</td></tr>
                            ) : (
                                filteredStudents.map((s, i) => (
                                    <tr key={s._id} className={`hover:bg-indigo-50/50 transition-colors ${selectedStudentIds.includes(s._id) ? 'bg-indigo-50/30' : ''}`}>
                                        <td className="px-6 py-4">
                                            <button onClick={() => toggleSelectStudent(s._id)} className="text-indigo-400 hover:text-indigo-600">
                                                {selectedStudentIds.includes(s._id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900">{s.name}</td>
                                        <td className="px-6 py-4 font-mono text-indigo-600">{s.rollNumber}</td>
                                        <td className="px-6 py-4"><span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg text-xs font-black">✨ {s.xp}</span></td>
                                        <td className="px-6 py-4">
                                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden max-w-[100px]">
                                                <div className="bg-indigo-600 h-full" style={{ width: `${s.progress}%` }} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-3">
                                                <button onClick={() => handleEditStudent(i)} className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button>
                                                <button onClick={() => handleDeleteStudent(i)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- Modal --- */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-8 rounded-[2rem] w-full max-w-md relative shadow-2xl border-t-[10px] border-indigo-600">
                        <button onClick={() => { setShowModal(false); setEditIndex(null); }} className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 hover:bg-red-500 hover:text-white transition-all">
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-2xl font-black text-gray-900 mb-6 uppercase tracking-tight">{editIndex !== null ? 'Edit Student' : 'Add Students'}</h3>

                        <div className="mb-6 p-4 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 flex flex-col items-center">
                            <Upload className="text-gray-400 mb-2" />
                            <label className="text-xs font-black text-gray-500 uppercase cursor-pointer">
                                Batch Upload CSV
                                <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
                            </label>
                        </div>

                        <div className="space-y-3">
                            <input type="text" placeholder="Name" value={manualStudent.name} onChange={(e) => setManualStudent({ ...manualStudent, name: e.target.value })} className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                            <input type="text" placeholder="Roll Number" value={manualStudent.rollNumber} onChange={(e) => setManualStudent({ ...manualStudent, rollNumber: e.target.value })} className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                            <input type="email" placeholder="Email" value={manualStudent.email} onChange={(e) => setManualStudent({ ...manualStudent, email: e.target.value })} className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                            <div className="grid grid-cols-2 gap-3">
                                <input type="number" placeholder="XP" value={manualStudent.xp} onChange={(e) => setManualStudent({ ...manualStudent, xp: e.target.value })} className="bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                                <input type="number" placeholder="Progress %" value={manualStudent.progress} onChange={(e) => setManualStudent({ ...manualStudent, progress: e.target.value })} className="bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                        </div>

                        <button onClick={handleAddOrEditStudent} className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl transition-all shadow-xl uppercase tracking-widest text-xs">
                            {editIndex !== null ? 'Commit Changes' : 'Save Student'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseStudents;
