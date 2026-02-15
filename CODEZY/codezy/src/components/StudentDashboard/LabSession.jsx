import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Play, CheckCircle2, XCircle, Info, 
  AlertTriangle, Terminal, Clock, Target, ShieldCheck,
  Send, Layers, Loader2
} from 'lucide-react';
import axios from 'axios';
import Editor from '@monaco-editor/react';

const LabSession = () => {
  const { labId } = useParams();
  const navigate = useNavigate();
  const [labData, setLabData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for multi-task handling
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  const [taskCodes, setTaskCodes] = useState({}); // Stores code per task ID
  const [activeTab, setActiveTab] = useState('problem'); // 'problem' or 'testcases'
  
  // New: Code execution states
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);

  useEffect(() => {
    // Check if labId is available
    if (!labId) {
      console.error('Lab ID is missing from URL parameters!');
      alert('Invalid lab ID. Returning to dashboard...');
      navigate('/student-dashboard');
      return;
    }

    // Fetches lab details including tasks, constraints, and test cases
    console.log('Fetching lab details for labId:', labId);
    
    fetch(`http://localhost:5000/api/students/lab-details/${labId}`)
      .then(res => res.json())
      .then(data => {
        console.log('Lab data received:', data);
        console.log('Tasks count:', data.tasks?.length);
        
        setLabData(data);
        // Initialize taskCodes with empty strings or starter code if available
        const initialCodes = {};
        if (data.tasks && Array.isArray(data.tasks)) {
          data.tasks.forEach(task => {
            console.log('Task ID:', task._id, 'Title:', task.title);
            initialCodes[task._id] = ""; 
          });
        } else {
          console.error('No tasks found in lab data!');
        }
        setTaskCodes(initialCodes);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching lab details:", err);
        alert('Failed to load lab data. Please try again.');
        setIsLoading(false);
      });
  }, [labId, navigate]);

  const handleCodeChange = (newCode) => {
    const currentTaskId = labData.tasks[activeTaskIndex]._id;
    setTaskCodes(prev => ({
      ...prev,
      [currentTaskId]: newCode
    }));
  };

  // Run code (without saving)
  const handleRunCode = async () => {
    // Validate lab data is loaded
    if (!labData || !labData.tasks || labData.tasks.length === 0) {
      alert('Lab data is still loading. Please wait...');
      return;
    }

    const currentTaskId = labData.tasks[activeTaskIndex]?._id;
    const code = taskCodes[currentTaskId];

    // Debug logging
    console.log('Debug - Running code with:', {
      labId,
      taskId: currentTaskId,
      language: selectedLanguage,
      codeLength: code?.length,
      activeTaskIndex,
      totalTasks: labData.tasks.length
    });

    // Validate all required fields
    if (!currentTaskId) {
      alert('Task ID is missing. Please refresh the page.');
      return;
    }

    if (!labId) {
      alert('Lab ID is missing. Please return to dashboard and try again.');
      return;
    }

    if (!code || !code.trim()) {
      alert('Please write some code first!');
      return;
    }

    setIsRunning(true);
    setExecutionResult(null);

    try {
      const studentId = JSON.parse(localStorage.getItem('user'))?.id;
      
      const requestPayload = {
        code,
        language: selectedLanguage,
        labId,
        taskId: currentTaskId,
        studentId
      };

      console.log('Sending code execution request:', requestPayload);
      console.log('Request payload validation:',  {
        hasCode: !!code,
        hasLanguage: !!selectedLanguage,
        hasLabId: !!labId,
        hasTaskId: !!currentTaskId,
        hasStudentId: !!studentId
      });
      
      const response = await axios.post('http://localhost:5000/api/code-execution/run', requestPayload);

      setExecutionResult(response.data);
    } catch (error) {
      console.error('Execution error:', error);
      console.error('Error response:', error.response?.data);
      setExecutionResult({
        success: false,
        error: error.response?.data?.error || error.message || 'Execution failed',
        terminal: `Error: ${error.response?.data?.error || error.message || 'An error occurred'}`,
        score: 0,
        maxScore: 10
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Submit code (with saving)
  const handleSubmitCode = async () => {
    // Validate lab data is loaded
    if (!labData || !labData.tasks || labData.tasks.length === 0) {
      alert('Lab data is still loading. Please wait...');
      return;
    }

    const currentTaskId = labData.tasks[activeTaskIndex]?._id;
    const code = taskCodes[currentTaskId];

    if (!currentTaskId || !labId) {
      alert('Required data is missing. Please refresh the page.');
      return;
    }

    if (!code || !code.trim()) {
      alert('Please write some code before submitting!');
      return;
    }

    if (!confirm('Are you sure you want to submit? This will be graded and saved.')) {
      return;
    }

    setIsRunning(true);
    setExecutionResult(null);

    try {
      const studentId = JSON.parse(localStorage.getItem('user'))?.id;
      
      const response = await axios.post('http://localhost:5000/api/code-execution/submit', {
        code,
        language: selectedLanguage,
        labId,
        taskId: currentTaskId,
        studentId
      });

      setExecutionResult(response.data.evaluation);
      alert(`Submitted successfully! Score: ${response.data.evaluation.score}/10. XP gained: +${response.data.xpGained}`);
    } catch (error) {
      console.error('Submission error:', error);
      alert(`Submission failed: ${error.response?.data?.error || error.message || 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
    </div>
  );

  const currentTask = labData?.tasks[activeTaskIndex];

  return (
    <div className="h-screen bg-[#0F172A] text-slate-300 flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-slate-800 bg-[#1E293B] px-6 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col border-l border-slate-700 pl-4">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{labData?.courseCode}</span>
            <h1 className="text-sm font-black text-white leading-none uppercase">{labData?.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 text-xs font-bold">
            <Target size={14} className="text-emerald-500" />
            <span>{labData?.marks} Total Marks</span>
          </div>
          <button 
            onClick={handleSubmitCode}
            disabled={isRunning || !labData || !labData.tasks || labData.tasks.length === 0}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-900/20"
          >
             <Send size={14} /> Submit Solution
          </button>
        </div>
      </header>

      {/* Task Switcher Bar for Multiple Tasks */}
      <div className="h-10 bg-[#1E293B]/50 border-b border-slate-800 flex items-center px-4 gap-2">
        <div className="flex items-center gap-2 px-3 border-r border-slate-700 mr-2">
          <Layers size={14} className="text-slate-500" />
          <span className="text-[10px] font-black text-slate-500 uppercase">Tasks</span>
        </div>
        {labData?.tasks.map((task, idx) => (
          <button
            key={task._id}
            onClick={() => setActiveTaskIndex(idx)}
            className={`px-4 h-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeTaskIndex === idx 
              ? 'text-indigo-400 border-b-2 border-indigo-400 bg-indigo-400/5' 
              : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {idx + 1}. {task.title}
          </button>
        ))}
      </div>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel: Problem, Constraints & Test Cases */}
        <aside className="w-[480px] border-r border-slate-800 flex flex-col bg-[#0F172A] shrink-0">
          <div className="flex border-b border-slate-800 bg-[#1E293B]/30">
            <button onClick={() => setActiveTab('problem')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'problem' ? 'text-indigo-400 border-b-2 border-indigo-400 bg-indigo-400/5' : 'text-slate-500'}`}>
              Description
            </button>
            <button onClick={() => setActiveTab('testcases')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'testcases' ? 'text-indigo-400 border-b-2 border-indigo-400 bg-indigo-400/5' : 'text-slate-500'}`}>
              Test Cases
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            <AnimatePresence mode="wait">
              {activeTab === 'problem' ? (
                <motion.div 
                  key={`prob-${activeTaskIndex}`}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                  className="space-y-8"
                >
                  <section>
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-white font-bold text-lg">{currentTask?.title}</h2>
                      <span className="text-[10px] font-bold bg-indigo-500/10 px-2 py-1 rounded text-indigo-400">{currentTask?.marks} pts</span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-400 bg-slate-900/50 p-5 rounded-2xl border border-slate-800">
                      {currentTask?.description || "No description provided."}
                    </p>
                  </section>

                  {currentTask?.codeConstraints?.length > 0 && (
                    <section className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase text-amber-500 tracking-widest flex items-center gap-2">
                        <ShieldCheck size={14} /> Structural Constraints
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        {currentTask.codeConstraints.map((con, cIdx) => (
                          <div key={cIdx} className={`text-xs p-3 rounded-xl border ${con.type === 'Forbidden' ? 'bg-rose-500/5 border-rose-500/20 text-rose-400' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'}`}>
                            <span className="font-bold">{con.type}:</span> {con.construct} 
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key={`test-${activeTaskIndex}`}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <h2 className="text-white font-bold text-sm mb-4">Verification Suites</h2>
                  {currentTask?.testCases?.map((tc, i) => (
                    <div key={i} className={`bg-slate-900 rounded-xl border ${tc.isHidden ? 'border-dashed border-slate-800' : 'border-slate-800'} overflow-hidden`}>
                      <div className="bg-slate-800/50 px-4 py-2 text-[9px] font-bold uppercase tracking-wider flex justify-between">
                        <span>Case {i + 1}</span>
                        <span className={tc.isHidden ? "text-amber-500" : "text-indigo-400"}>
                          {tc.isHidden ? "Hidden Case" : "Public Case"}
                        </span>
                      </div>
                      {!tc.isHidden ? (
                        <div className="p-4 space-y-4">
                          <div>
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Input</label>
                            <pre className="mt-1 bg-black/30 p-3 rounded-lg text-xs font-mono text-emerald-400 overflow-x-auto border border-slate-800">{tc.input || "No Input"}</pre>
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Expected Output</label>
                            <pre className="mt-1 bg-black/30 p-3 rounded-lg text-xs font-mono text-blue-400 overflow-x-auto border border-slate-800">{tc.expectedOutput}</pre>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 flex flex-col items-center justify-center gap-3 italic text-xs text-slate-500">
                          <AlertTriangle size={24} className="text-slate-700" />
                          <span>Input/Output hidden for evaluation</span>
                        </div>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>

        {/* Right Panel: Editor & Execution Console */}
        <section className="flex-1 flex flex-col bg-[#111827]">
          {/* Code Editor Space */}
          <div className="flex-1 p-4 relative">
             <div className="absolute top-8 right-10 z-10 flex items-center gap-3">
                <select 
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="text-[10px] font-black uppercase tracking-widest bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="python">Python 3.11</option>
                  <option value="java">Java 17</option>
                  <option value="cpp">C++ 17</option>
                </select>
                <div className="h-4 w-px bg-slate-800"></div>
                <Info size={14} className="text-slate-600" />
             </div>
            <Editor
              height="100%"
              language={selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage}
              value={taskCodes[currentTask?._id] || ""}
              onChange={(value) => handleCodeChange(value || "")}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'Fira Code', 'Consolas', 'Courier New', monospace",
                fontLigatures: true,
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                formatOnPaste: true,
                formatOnType: true,
                tabSize: 4,
                insertSpaces: true,
                renderWhitespace: 'selection',
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
                mouseWheelZoom: true,
                bracketPairColorization: { enabled: true },
                guides: {
                  bracketPairs: true,
                  indentation: true
                }
              }}
              loading={
                <div className="flex items-center justify-center h-full bg-[#1E293B]">
                  <Loader2 className="animate-spin text-indigo-500" size={32} />
                </div>
              }
            />
          </div>

          {/* Execution Console */}
          <div className="h-[280px] bg-[#020617] border-t border-slate-800 flex flex-col">
            <div className="flex justify-between items-center px-6 py-3 border-b border-slate-800 bg-slate-900/30">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <Terminal size={14} /> Results Console
              </div>
              <button 
                onClick={handleRunCode}
                disabled={isRunning || !labData || !labData.tasks || labData.tasks.length === 0}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-6 py-1.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-900/20 active:scale-95"
              >
                {isRunning ? (
                  <>
                    <Loader2 size={12} className="animate-spin" /> Running...
                  </>
                ) : (
                  <>
                    <Play size={12} fill="currentColor" /> Run Current Task
                  </>
                )}
              </button>
            </div>
            <div className="flex-1 p-6 font-mono text-xs overflow-y-auto space-y-4 custom-scrollbar">
               {!executionResult && !isRunning && (
                 <div className="flex items-center gap-3 text-slate-600">
                    <span className="animate-pulse">●</span>
                    <span className="uppercase text-[10px] font-bold tracking-widest">Waiting for execution...</span>
                 </div>
               )}
               
               {isRunning && (
                 <div className="flex items-center gap-3 text-indigo-400">
                    <Loader2 size={14} className="animate-spin" />
                    <span className="uppercase text-[10px] font-bold tracking-widest">Executing code...</span>
                 </div>
               )}

               {executionResult && (
                 <div className="space-y-4">
                   {/* Score Display */}
                   <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
                     <div className="flex items-center justify-between mb-2">
                       <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Score</span>
                       <span className={`text-2xl font-bold ${executionResult.score >= 7 ? 'text-green-400' : executionResult.score >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                         {executionResult.score}/{executionResult.maxScore}
                       </span>
                     </div>
                     {executionResult.testCases && executionResult.structural && (
                       <div className="text-[10px] text-slate-500 space-y-1">
                         <div>Test Cases: {executionResult.testCases.passed}/{executionResult.testCases.total}</div>
                         <div>Structural: {executionResult.structural.passed}/{executionResult.structural.total}</div>
                       </div>
                     )}
                   </div>

                   {/* Terminal Output */}
                   {executionResult.terminal && (
                     <div className="bg-black rounded-lg p-4 border border-slate-800">
                       <pre className="text-slate-300 whitespace-pre-wrap text-[10px] leading-relaxed">
                         {executionResult.terminal}
                       </pre>
                     </div>
                   )}

                   {/* Error Display */}
                   {executionResult.error && !executionResult.terminal && (
                     <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                       <div className="flex items-center gap-2 mb-2">
                         <XCircle size={14} className="text-red-400" />
                         <span className="text-red-400 font-bold text-xs">Error</span>
                       </div>
                       <pre className="text-red-300 text-[10px] whitespace-pre-wrap">
                         {executionResult.error}
                       </pre>
                     </div>
                   )}
                 </div>
               )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LabSession;