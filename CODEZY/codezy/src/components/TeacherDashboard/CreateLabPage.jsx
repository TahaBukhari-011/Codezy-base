import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { Save, X, Plus, Trash2, Calendar, Clock, FileText, Code, Sparkles, Zap, Eye, Sliders, Check, Ban } from 'lucide-react';
import { useParams } from "react-router-dom";

const CODE_CONSTRUCTS = {
    FOR_LOOP: 'for loop',
    WHILE_LOOP: 'while loop',
    RECURSION: 'Recursion',
    IF_ELSE: 'if-else statement',
    ARRAY: 'Array/List',
    GLOBAL: 'Global Variables',
    CUSTOM_FUNC: 'Custom Function/Method',
    BUILT_IN_SORT: 'Built-in Sort Function',
};

const CONSTRAINT_OPTIONS = [
    { label: 'Loops (Any)', value: 'LOOP' },
    { label: 'For Loop', value: CODE_CONSTRUCTS.FOR_LOOP },
    { label: 'While Loop', value: CODE_CONSTRUCTS.WHILE_LOOP },
    { label: 'Recursion', value: CODE_CONSTRUCTS.RECURSION },
    { label: 'If-Else', value: CODE_CONSTRUCTS.IF_ELSE },
    { label: 'Arrays/Lists', value: CODE_CONSTRUCTS.ARRAY },
    { label: 'Global Variables', value: CODE_CONSTRUCTS.GLOBAL },
    { label: 'Built-in Sort', value: CODE_CONSTRUCTS.BUILT_IN_SORT },
    { label: 'Custom Function', value: CODE_CONSTRUCTS.CUSTOM_FUNC },
];

const CreateLabPage = () => {
    // --- 1. INITIALIZE REFS ---
    const tasksSectionRef = useRef(null);
    const instructionsSectionRef = useRef(null);

    const [labData, setLabData] = useState({
        title: '',
        course: '', 
        description: '',
        startDate: '', 
        startTime: '', 
        dueDate: '',
        dueTime: '',
        totalMarks: '',
        instructions: '',
        difficulty: 'Medium'
    });

    const [tasks, setTasks] = useState([
        { 
            id: Date.now() + 1,
            title: 'Initial Problem Statement', 
            marks: 10, 
            description: 'Describe the first required function or algorithm here.', 
            testCases: [
                { 
                    id: Date.now(), 
                    input: '1 2 3', 
                    expectedOutput: '6', 
                    comparisonMode: 'Exact', 
                    notes: '', 
                    isHidden: false 
                }
            ],
            codeConstraints: [
                { 
                    id: Date.now(),
                    type: 'Required',
                    construct: CODE_CONSTRUCTS.CUSTOM_FUNC,
                    specifics: { minDepth: 0, maxDepth: 0 }
                }
            ]
        }
    ]);
    
    const [fetchedCourses, setFetchedCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [activeSection, setActiveSection] = useState('basic');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const navigate = useNavigate();
   
    const { labId, courseId, classId } = useParams();
    const [isImportedToCourse, setIsImportedToCourse] = useState(false);
    const [originalCourseClass, setOriginalCourseClass] = useState('');
    const [originalLabData, setOriginalLabData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!labId || !courseId || !classId) return;

        const fetchLab = async () => {
            try {
                setLoading(true);
                setSubmitError(null); 
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    `http://localhost:5000/api/courses/${courseId}/classes/${classId}/labs/${labId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                
                const lab = res.data;
                if (!lab) return;

                setOriginalLabData(lab);
                
                const formatDate = (dateValue) => {
                    if (!dateValue) return '';
                    const d = new Date(dateValue);
                    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
                };

                setLabData({
                    title: lab.title ?? '',
                    description: lab.description ?? '',
                    instructions: lab.instructions ?? '',
                    startDate: formatDate(lab.startDate),
                    startTime: lab.startTime ?? '',
                    dueDate: formatDate(lab.dueDate),
                    dueTime: lab.dueTime ?? '',
                    totalMarks: lab.marks ?? '',
                    difficulty: lab.difficulty ?? 'Medium',
                    course: `${courseId}::${classId}`
                });

                setOriginalCourseClass(`${courseId}::${classId}`);

                const mappedTasks = (lab.tasks ?? []).map((task, tIndex) => ({
                    ...task,
                    id: task.id || Date.now() + tIndex,
                    marks: task.marks ?? '',
                    description: task.description ?? '',
                    testCases: (task.testCases ?? []).map((tc, i) => ({
                        ...tc,
                        id: tc.id || Date.now() + tIndex + i + 100,
                        input: tc.input ?? '',
                        expectedOutput: tc.expectedOutput ?? '',
                        comparisonMode: tc.comparisonMode ?? 'Exact'
                    })),
                    codeConstraints: (task.codeConstraints ?? []).map((c, i) => ({
                        ...c,
                        id: c.id || Date.now() + tIndex + i + 200,
                        construct: c.construct ?? '',
                        type: c.type ?? 'Required',
                        specifics: c.specifics || { minDepth: 0, maxDepth: 0 }
                    }))
                }));

                setTasks(mappedTasks);

            } catch (err) {
                console.error("Dashboard Load Error:", err);
                setSubmitError("Failed to load draft. The lab might have been moved, deleted, or the server is offline.");
            } finally {
                setLoading(false);
            }
        };

        fetchLab();
    }, [labId, courseId, classId]);

    useEffect(() => {
        const loadCoursesFromApi = async () => {
            try {
                setLoadingCourses(true);
                const teacherId = localStorage.getItem('userId');
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://localhost:5000/api/courses/teacher/${teacherId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const data = res.data || [];
                const processed = [];
                data.forEach(course => {
                    (course.classes || []).forEach(cls => {
                        processed.push({
                            value: `${course._id}::${cls._id}`,
                            label: `${course.title} (${cls.name})`,
                        });
                    });
                });
                setFetchedCourses(processed);
            } catch (err) {
                console.error('Error fetching courses:', err);
            } finally {
                setLoadingCourses(false);
            }
        };
        loadCoursesFromApi();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLabData(prev => ({ ...prev, [name]: value }));
    };

    const toISODateTime = (date, time) => {
        if (!date || !time) return null;
        const d = new Date(`${date}T${time}`);
        return isNaN(d.getTime()) ? null : d.toISOString();
    };

    const handleCreateLab = async (e, statusOverride = "Active") => {
        if (e) e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);

        const courseClassValue = labData.course;
        if (!courseClassValue) {
            setSubmitError("Please select a Course & Class.");
            setIsSubmitting(false);
            return;
        }

        const startDateTime = toISODateTime(labData.startDate, labData.startTime);
        const endDateTime = toISODateTime(labData.dueDate, labData.dueTime);

        if (!startDateTime || !endDateTime) {
            setSubmitError("Invalid date/time format.");
            setIsSubmitting(false);
            return;
        }

        const [targetCourseId, targetClassId] = courseClassValue.split("::");
        
        // Ensure numbers are actually numbers and not NaN
        const totalMarks = Number(labData.totalMarks) || 0;

        const newLabPayload = {
            title: labData.title.trim(),
            marks: totalMarks,
            description: labData.description,
            instructions: labData.instructions,
            difficulty: labData.difficulty,
            isShared: isImportedToCourse,
            status: statusOverride, 
            startDate: startDateTime,
            startTime: labData.startTime,
            dueDate: endDateTime,
            dueTime: labData.dueTime,
            // Clean up tasks to ensure standard data types
            tasks: tasks.map(task => ({
                title: task.title.trim(),
                description: task.description,
                marks: Number(task.marks) || 0,
                // Map test cases
                testCases: task.testCases.map(tc => ({
                    input: tc.input,
                    expectedOutput: tc.expectedOutput,
                    comparisonMode: tc.comparisonMode || 'Exact',
                    isHidden: !!tc.isHidden,
                    notes: tc.notes || ""
                })),
                // Map constraints
                codeConstraints: task.codeConstraints.map((c, cIndex) => ({
                    construct: c.construct,
                    type: c.type,
                    specifics: {
                        minDepth: Number(c.specifics.minDepth) || 0,
                        maxDepth: Number(c.specifics.maxDepth) || 0
                    }
                }))
            })),
        };

        // Validation: Sum of task marks
        const sumOfTaskMarks = newLabPayload.tasks.reduce((sum, task) => sum + task.marks, 0);
        if (sumOfTaskMarks !== totalMarks) {
            setSubmitError(`Sum of Task Marks (${sumOfTaskMarks}) does not equal Total Lab Marks (${totalMarks}).`);
            setIsSubmitting(false);
            return;
        }

        try {
            // Log the payload to console to inspect before it hits the server
            console.log("Submitting Payload:", newLabPayload);
            const token = localStorage.getItem("token");
            if (labId && courseClassValue === originalCourseClass) {
                // UPDATE EXISTING
                await axios.put(`http://localhost:5000/api/courses/${targetCourseId}/classes/${targetClassId}/labs/${labId}`, newLabPayload, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            } else {
                // CREATE NEW (OR EXPORT TO NEW CLASS)
                await axios.post(`http://localhost:5000/api/courses/${targetCourseId}/classes/${targetClassId}/labs`, newLabPayload, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            }
            
            alert(`Lab saved successfully!`);
            navigate("/teacher");
        } catch (err) {
            console.error("Submission error details:", err.response?.data);
            setSubmitError(`Server Error: ${err.response?.data?.message || err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTaskChange = (id, field, value) => {
        setTasks(tasks.map(task => task.id === id ? { ...task, [field]: value } : task));
    };

    const addTask = () => {
        const newTask = {
            id: Date.now(),
            title: '',
            marks: '',
            description: '',
            testCases: [{ id: Date.now(), input: '', expectedOutput: '', comparisonMode: 'Exact', notes: '', isHidden: false }],
            codeConstraints: [{ id: Date.now(), type: 'Required', construct: CODE_CONSTRUCTS.CUSTOM_FUNC, specifics: { minDepth: 0, maxDepth: 0 } }]
        };
        setTasks([...tasks, newTask]);
    };

    const removeTask = (id) => {
        if (tasks.length > 1) setTasks(tasks.filter(task => task.id !== id));
    };

    const addTestCase = (taskId) => {
        setTasks(tasks.map(task => 
            task.id === taskId ? { ...task, testCases: [...task.testCases, { id: Date.now(), input: '', expectedOutput: '', comparisonMode: 'Exact', notes: '', isHidden: false }] } : task
        ));
    };

    const removeTestCase = (taskId, testCaseId) => {
        setTasks(tasks.map(task => 
            task.id === taskId ? { ...task, testCases: task.testCases.filter(tc => tc.id !== testCaseId) } : task
        ));
    };

    const handleTestCaseChange = (taskId, testCaseId, field, value) => {
        setTasks(tasks.map(task => 
            task.id === taskId ? { ...task, testCases: task.testCases.map(tc => tc.id === testCaseId ? { ...tc, [field]: value } : tc) } : task
        ));
    };

    const addConstraint = (taskId, type) => {
        setTasks(tasks.map(task => 
                task.id === taskId ? { ...task, codeConstraints: [...task.codeConstraints, { id: Date.now(), type, construct: CONSTRAINT_OPTIONS[0].value, specifics: { minDepth: 0, maxDepth: 0 } }] } : task
        ));
    };

    const removeConstraint = (taskId, constraintId) => {
        setTasks(tasks.map(task => 
                task.id === taskId ? { ...task, codeConstraints: task.codeConstraints.filter(c => c.id !== constraintId) } : task
        ));
    };

    const handleConstraintFieldChange = (taskId, constraintId, field, value) => {
        setTasks(tasks.map(task => 
                task.id === taskId ? { ...task, codeConstraints: task.codeConstraints.map(c => c.id === constraintId ? (field.includes('specifics.') ? { ...c, specifics: { ...c.specifics, [field.split('.')[1]]: parseInt(value) || 0 } } : { ...c, [field]: value }) : c) } : task
        ));
    };

    const scrollToSection = (section) => {
        setActiveSection(section);
        if (section === 'tasks' && tasksSectionRef.current) {
            tasksSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (section === 'instructions' && instructionsSectionRef.current) {
            instructionsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const FloatingParticles = () => (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
                <div key={i} className="absolute w-1 h-1 bg-indigo-300/20 rounded-full animate-float"
                    style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 8}s`, animationDuration: `${20 + Math.random() * 15}s` }}
                />
            ))}
        </div>
    );

    const ProgressIndicator = () => (
        <div className="flex items-center justify-center mb-8">
            {['basic', 'tasks', 'instructions'].map((section, index) => (
                <React.Fragment key={section}>
                    <div className={`flex flex-col items-center cursor-pointer transition-all duration-500 ${activeSection === section ? 'scale-110' : 'scale-100'}`} onClick={() => scrollToSection(section)}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${activeSection === section ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'border-gray-300 text-gray-400'}`}>
                            {index + 1}
                        </div>
                        <span className={`text-xs mt-2 font-medium capitalize transition-colors duration-300 ${activeSection === section ? 'text-indigo-600' : 'text-gray-500'}`}>{section}</span>
                    </div>
                    {index < 2 && <div className={`w-16 h-1 mx-2 transition-all duration-500 ${activeSection === section ? 'bg-indigo-600' : 'bg-gray-200'}`} />}
                </React.Fragment>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 relative overflow-hidden">
            <FloatingParticles />
            <div className="absolute top-0 -left-20 w-80 h-80 bg-gradient-to-r from-cyan-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-0 -right-20 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-500/10 rounded-full blur-3xl animate-pulse-slower"></div>

            <motion.nav initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <motion.div whileHover={{ rotate: 5, scale: 1.1 }} className="text-indigo-600 font-bold text-xl flex items-center cursor-pointer">
                                <span className="text-2xl mr-1">&lt;/&gt;</span>
                                <span>Codezy</span>
                            </motion.div>
                        </div>
                        <div className="hidden md:flex space-x-8 font-medium">
                            <a href="/teacher" className="hover:text-indigo-600 transition">Dashboard</a>
                            <a href="/mycourses" className="hover:text-indigo-600 transition">My Courses</a>
                            <a href="/createlab" className="text-indigo-600 border-b-2 border-indigo-600">Create Lab</a>
                            <a href="/reports" className="hover:text-indigo-600 transition">Reports</a>
                            <a href="/profile" className="hover:text-indigo-600 transition">Profile</a>
                            <a href="/login" className="hover:text-indigo-600 transition">Logout</a>
                        </div>
                    </div>
                </div>
            </motion.nav>

            <div className="max-w-6xl mx-auto p-6 relative z-10">
                <div className="text-center mb-8 transform hover:scale-105 transition-transform duration-500">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{labId ? "Edit Lab" : "Create New Lab"}</h1>
                    <p className="text-gray-600 text-lg animate-pulse">Design and assign a new lab to your students with interactive features</p>
                    <div className="flex justify-center mt-4"><Sparkles className="text-yellow-500 animate-spin-slow" size={24} /></div>
                </div>

                <ProgressIndicator />

                <form onSubmit={(e) => handleCreateLab(e, "Active")} className="space-y-8">
                    {submitError && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative shadow-md">
                            <strong className="font-bold mr-2">Error:</strong>
                            <span className="block sm:inline">{submitError}</span>
                            <span onClick={() => setSubmitError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"><X size={20} /></span>
                        </motion.div>
                    )}
                
                    {/* Basic Info Section */}
                    <div className={`bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 transform transition-all duration-700 ${activeSection === 'basic' ? 'scale-100 opacity-100' : 'scale-95 opacity-70'}`}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg shadow-lg"><FileText size={28} className="text-white" /></div> Basic Information
                            </h2>
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium animate-pulse">Required</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Zap size={16} className="text-yellow-500" /> Lab Title *</label>
                                <input type="text" name="title" value={labData.title} onChange={handleInputChange} placeholder="e.g., Sorting Algorithms Implementation" className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all duration-300 transform hover:scale-105 hover:shadow-lg" required />
                            </div>

                            <div className="relative group">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Course & Class *</label>
                                <select name="course" value={labData.course} onChange={handleInputChange} className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-lg appearance-none bg-white" required disabled={loadingCourses}>
                                    {loadingCourses ? <option value="">Loading courses...</option> : fetchedCourses.length === 0 ? <option value="">No courses assigned</option> : (
                                        <>
                                            <option value="">Select a Course (Class)</option>
                                            {fetchedCourses.map((course) => <option key={course.value} value={course.value}>{course.label}</option>)}
                                        </>
                                    )}
                                </select>
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-indigo-600 transition-colors">▼</div>
                            </div>

                            <div className="relative group">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Difficulty Level</label>
                                <select name="difficulty" value={labData.difficulty} onChange={handleInputChange} className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-lg">
                                    <option value="Easy">🎯 Easy</option>
                                    <option value="Medium">⚡ Medium</option>
                                    <option value="Hard">🔥 Hard</option>
                                </select>
                            </div>

                            <div className="relative group">
                                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Calendar size={16} className="text-green-600" /> Start Date *</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input type="date" name="startDate" value={labData.startDate} onChange={handleInputChange} className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500" required />
                                </div>
                            </div>

                            <div className="relative group">
                                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Clock size={16} className="text-green-600" /> Start Time *</label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input type="time" name="startTime" value={labData.startTime} onChange={handleInputChange} className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500" required />
                                </div>
                            </div>

                            <div className="relative group">
                                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Calendar size={16} className="text-indigo-600" /> Due Date *</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input type="date" name="dueDate" value={labData.dueDate} onChange={handleInputChange} className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500" required />
                                </div>
                            </div>

                            <div className="relative group">
                                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Clock size={16} className="text-indigo-600" /> Due Time *</label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input type="time" name="dueTime" value={labData.dueTime} onChange={handleInputChange} className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500" required />
                                </div>
                            </div>
                            
                            <div className="relative group">
                                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Zap size={16} className="text-red-500" /> Total Lab Marks *</label>
                                <input type="number" name="totalMarks" value={labData.totalMarks} onChange={handleInputChange} placeholder="e.g., 100" className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500" required />
                            </div>

                            <div className="md:col-span-2 group">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Description (Short Intro)</label>
                                <textarea name="description" value={labData.description} onChange={handleInputChange} placeholder="Provide overview..." rows="4" className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none"></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Tasks Section */}
                    <div ref={tasksSectionRef} className={`bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 transform transition-all duration-700 ${activeSection === 'tasks' ? 'scale-100 opacity-100' : 'scale-95 opacity-70'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-lg"><Code size={28} className="text-white" /></div> Lab Tasks
                            </h2>
                            <button type="button" onClick={addTask} className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl transform hover:scale-105 transition-all duration-300 group">
                                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" /> Add Task
                            </button>
                        </div>

                        <div className="space-y-6">
                            {tasks.map((task, index) => (
                                <div key={task.id} className="border-2 border-gray-200 rounded-2xl p-6 bg-white/50 backdrop-blur-sm transform hover:scale-[1.01] hover:shadow-xl transition-all duration-500">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">{index + 1}</div>
                                            <h3 className="font-bold text-gray-900 text-lg">Task {index + 1}</h3>
                                        </div>
                                        {tasks.length > 1 && (
                                            <button type="button" onClick={() => removeTask(task.id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={20} /></button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4 mb-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
                                            <input type="text" value={task.title} onChange={(e) => handleTaskChange(task.id, 'title', e.target.value)} placeholder="Title" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Marks</label>
                                            <input type="number" value={task.marks} onChange={(e) => handleTaskChange(task.id, 'marks', e.target.value)} placeholder="10" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500" />
                                        </div>
                                        <div className="md:col-span-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Task Description</label>
                                            <textarea value={task.description} onChange={(e) => handleTaskChange(task.id, 'description', e.target.value)} placeholder="Describe problem..." rows="3" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none"></textarea>
                                        </div>
                                    </div>

                                    {/* Test Cases Sub-section */}
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <h4 className="text-xl font-bold text-gray-800 mb-4">A. Functional Test Cases</h4>
                                        <div className="space-y-4">
                                            {task.testCases.map((tc, tcIndex) => (
                                                <div key={tc.id} className="p-4 border border-gray-300 rounded-xl bg-white shadow-sm">
                                                    <div className="flex justify-between items-center mb-3 border-b pb-2">
                                                        <span className="font-semibold text-gray-700">Test Case #{tcIndex + 1}</span>
                                                        <div className="flex items-center space-x-3">
                                                            <label className="flex items-center gap-1 text-sm text-gray-600">
                                                                <input type="checkbox" checked={tc.isHidden} onChange={(e) => handleTestCaseChange(task.id, tc.id, 'isHidden', e.target.checked)} className="form-checkbox text-indigo-600 rounded" />
                                                                <span className="font-medium">Hidden</span>
                                                            </label>
                                                            <button type="button" onClick={() => removeTestCase(task.id, tc.id)} className={`text-red-500 ${task.testCases.length > 1 ? 'opacity-100' : 'opacity-50 cursor-not-allowed'}`} disabled={task.testCases.length <= 1}><Trash2 size={18} /></button>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                        <textarea placeholder="Input (stdin)" value={tc.input} onChange={(e) => handleTestCaseChange(task.id, tc.id, 'input', e.target.value)} rows="3" className="w-full px-3 py-2 border rounded-lg" />
                                                        <textarea placeholder="Expected Output" value={tc.expectedOutput} onChange={(e) => handleTestCaseChange(task.id, tc.id, 'expectedOutput', e.target.value)} rows="3" className="w-full px-3 py-2 border rounded-lg" />
                                                        
                                                        <div className="lg:col-span-2">
                                                            <label className="block text-xs font-medium text-gray-500 mb-1">Comparison Mode</label>
                                                            <select 
                                                                value={tc.comparisonMode} 
                                                                onChange={(e) => handleTestCaseChange(task.id, tc.id, 'comparisonMode', e.target.value)}
                                                                className="w-full md:w-1/3 px-3 py-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500"
                                                            >
                                                                <option value="Exact">Exact Match</option>
                                                                <option value="Contains">Contains (Partial)</option>
                                                                <option value="Regex">Regex Match</option>
                                                                <option value="Float">Float (Approximate)</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <button type="button" onClick={() => addTestCase(task.id)} className="mt-4 flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"><Plus size={18} className="mr-1" /> Add Test Case</button>
                                    </div>

                                    {/* Constraints Sub-section */}
                                    <div className="mt-8 pt-4 border-t border-gray-200">
                                        <h4 className="text-xl font-bold text-gray-800 mb-4">B. Code Structure Constraints</h4>
                                        <div className="space-y-4">
                                                {task.codeConstraints.map((constraint) => (
                                                    <motion.div key={constraint.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-xl shadow-md border-l-4 ${constraint.type === 'Required' ? 'bg-blue-50 border-blue-500' : 'bg-red-50 border-red-500'}`}>
                                                        <div className="flex items-center justify-between mb-3 font-bold text-gray-800">
                                                            <div className="flex items-center gap-2">{constraint.type === 'Required' ? <Check size={18} className="text-blue-500" /> : <Ban size={18} className="text-red-500" />} {constraint.type} Constraint</div>
                                                            <button type="button" onClick={() => removeConstraint(task.id, constraint.id)} className="text-gray-400 hover:text-red-600"><X size={16} /></button>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                                            <div className="col-span-1">
                                                                <label className="block text-xs font-medium text-gray-500 mb-1">Construct Type</label>
                                                                <select value={constraint.construct} onChange={(e) => handleConstraintFieldChange(task.id, constraint.id, 'construct', e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                                                                    {CONSTRAINT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                                </select>
                                                            </div>
                                                            {([CODE_CONSTRUCTS.FOR_LOOP, CODE_CONSTRUCTS.WHILE_LOOP, CODE_CONSTRUCTS.IF_ELSE].includes(constraint.construct) || constraint.construct === 'LOOP') && (
                                                                <>
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-500 mb-1">Min Nesting</label>
                                                                        <input type="number" value={constraint.specifics.minDepth} onChange={(e) => handleConstraintFieldChange(task.id, constraint.id, 'specifics.minDepth', e.target.value)} min="0" className="w-full px-3 py-2 border rounded-lg" />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-500 mb-1">Max Nesting</label>
                                                                        <input type="number" value={constraint.specifics.maxDepth} onChange={(e) => handleConstraintFieldChange(task.id, constraint.id, 'specifics.maxDepth', e.target.value)} min="0" className="w-full px-3 py-2 border rounded-lg" />
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                        </div>
                                        <div className="mt-4 flex gap-4">
                                                <button type="button" onClick={() => addConstraint(task.id, 'Required')} className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg text-sm"><Plus size={18} className="mr-1" /> Add Required</button>
                                                <button type="button" onClick={() => addConstraint(task.id, 'Forbidden')} className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg text-sm"><Plus size={18} className="mr-1" /> Add Forbidden</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Instructions Section */}
                    <div ref={instructionsSectionRef} className={`bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 transform transition-all duration-700 ${activeSection === 'instructions' ? 'scale-100 opacity-100' : 'scale-95 opacity-70'}`}>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3"><div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-lg"><FileText size={28} className="text-white" /></div> Additional Instructions</h2>
                        <textarea name="instructions" value={labData.instructions} onChange={handleInputChange} placeholder="Guidelines..." rows="6" className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none"></textarea>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-6 justify-center pt-8">
                        <button type="button" onClick={() => navigate("/teacher")} className="flex items-center gap-3 bg-gradient-to-r from-gray-400 to-gray-600 text-white px-8 py-4 rounded-xl transform hover:scale-105 transition-all duration-300"><X size={20} /><span className="font-semibold">Cancel</span></button>
                        
                        <button 
                            type="button" 
                            onClick={(e) => handleCreateLab(e, "Draft")} 
                            disabled={isSubmitting || loadingCourses} 
                            className={`flex items-center gap-3 bg-white border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-xl transform hover:scale-105 transition-all duration-300 ${isSubmitting ? 'opacity-50' : ''}`}
                        >
                            <FileText size={20} /><span className="font-semibold">Save as Draft</span>
                        </button>

                        <button type="submit" disabled={isSubmitting || loadingCourses} className={`flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl transform hover:scale-105 transition-all duration-300 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save size={20} className="group-hover:animate-bounce" /><span className="font-semibold">{labId ? "Update Lab" : "Create Lab"}</span></>}
                        </button>

                        <button type="button" onClick={() => setIsImportedToCourse(!isImportedToCourse)} className={`px-4 py-2 rounded-xl border-2 transition-all ${isImportedToCourse ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-200 text-gray-500'}`}>
                            {isImportedToCourse ? "✓ Imported to Course" : "Export to Course?"}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(180deg); } }
                @keyframes pulse-slow { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.8; } }
                @keyframes pulse-slower { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } }
                @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-float { animation: float 25s ease-in-out infinite; }
                .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
                .animate-pulse-slower { animation: pulse-slower 6s ease-in-out infinite; }
                .animate-spin-slow { animation: spin-slow 8s linear infinite; }
            `}</style>
        </div>
    );
};

export default CreateLabPage;