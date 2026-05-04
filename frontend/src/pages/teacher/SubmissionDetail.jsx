import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation} from 'react-router-dom';
import { useTheme } from '../../App';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  BarChart3, 
  LogOut, 
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Save,
  FileText,
  AlertTriangle,
  ChevronRight,
  Menu,
  X,
  MessageSquare
} from 'lucide-react';

import API from '../../api/axios';

const SubmissionDetailContent = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [manualGrades, setManualGrades] = useState({});

  useEffect(() => {
    fetchSubmissionDetail();
  }, [attemptId]);

  const fetchSubmissionDetail = async () => {
    try {
      const res = await API.get(`/attempts/${attemptId}/details`);
      const details = res.data;
      
      if (details.length === 0) {
        setData(null);
        setLoading(false);
        return;
      }

      const firstRow = details[0];
      const violations = 100 - (firstRow.integrity_score || 100);
      
      setData({
        submissionId: attemptId,
        studentName: firstRow.student_name,
        studentId: firstRow.student_id,
        examTitle: firstRow.exam_title,
        courseId: firstRow.course_id,
        submittedAt: new Date(firstRow.submitted_at).toLocaleString(),
        violations: Math.floor(violations / 20),
        responses: details.map((item, idx) => ({
          id: idx + 1,
          answer_id: item.answer_id,
          type: item.type,
          question: item.question_text,
          studentAnswer: item.type === 'MCQ' ? item.selected_option : item.descriptive_answer,
          correctAnswer: item.correct_answer,
          marks: item.marks_awarded || 0,
          maxMarks: item.max_marks
        }))
      });

      const initialGrades = {};
      details.forEach((item, idx) => {
        initialGrades[idx + 1] = item.marks_awarded || 0;
      });
      setManualGrades(initialGrades);
    } catch (error) {
      console.error('Error fetching submission:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalScore = useMemo(() => {
    return Object.values(manualGrades).reduce((acc, curr) => acc + Number(curr || 0), 0);
  }, [manualGrades]);

  const totalPossible = useMemo(() => {
    if (!data) return 0;
    return data.responses.reduce((acc, curr) => acc + curr.maxMarks, 0);
  }, [data]);

  const handleMarkChange = (id, val, max) => {
    const numVal = Math.min(max, Math.max(0, Number(val)));
    setManualGrades(prev => ({ ...prev, [id]: numVal }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const descriptiveQuestions = data.responses.filter(r => r.type === 'DESC');
      
      for (const question of descriptiveQuestions) {
        await API.post('/tests/evaluate', {
            answer_id: question.answer_id,
            marks_awarded: manualGrades[question.id]
          });
      }

      await API.post('/tests/calculate-score', { attempt_id: attemptId });

      alert('Grades saved successfully!');
      fetchSubmissionDetail(); // Reload data
    } catch (error) {
      console.error('Error saving grades:', error);
      alert('Failed to save grades');
    } finally {
      setIsSaving(false);
    }
  };

  const sidebarItems = [
    { Icon: LayoutDashboard, label: 'Dashboard', path: '/teacher/dashboard' },
    { Icon: ClipboardList, label: 'My Exams', path: '/teacher/exams' },
    { Icon: Users, label: 'Students', path: '/teacher/students' },
    { Icon: BarChart3, label: 'Analytics', path: '/teacher/analytics' },
  ];

  if (loading) return (
    <div className={`h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#0b0f1a]' : 'bg-slate-50'}`}>
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!data) return (
    <div className={`h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#0b0f1a]' : 'bg-slate-50'}`}>
      <div className="text-center">
        <p className={`text-xl font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Submission not found</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold">
          Go Back
        </button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen font-sans ${theme === 'dark' ? 'bg-[#0b0f1a] text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Main Content */}
      <main className="p-4 md:p-8 lg:p-12 space-y-8 pb-32">
        {/* Breadcrumb / Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <button onClick={() => navigate(-1)} className={`p-2.5 border rounded-xl shadow-sm shrink-0 ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-900'}`}>
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <h2 className={`text-2xl md:text-3xl font-black tracking-tight truncate ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{data.studentName}</h2>
              <p className="text-slate-500 font-medium text-xs md:text-sm truncate">
                ID: {data.studentId} <span className="text-slate-300 mx-2">•</span> {data.examTitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className={`p-4 rounded-2xl border-2 flex items-center gap-3 ${data.violations > 0 ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                {data.violations > 0 ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                <span className="text-[10px] font-black uppercase tracking-widest">{data.violations} Integrity Flag(s)</span>
             </div>
          </div>
        </header>

        {/* Floating Grade Summary (Mobile & Tablet) / Sidebar (Desktop) */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Questions List */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className={`text-xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Attempt Transcript</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{data.responses.length} Items</p>
            </div>

            {data.responses.map((resp, idx) => (
              <div key={resp.id} className={`rounded-[2.5rem] border shadow-sm overflow-hidden ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="p-8 md:p-10">
                  <div className="flex justify-between items-start mb-6">
                    <span className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">Question {idx + 1}</span>
                    <div className="flex items-center gap-3">
                       {resp.type === 'MCQ' && (
                         <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${resp.marks > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {resp.marks > 0 ? 'Correct' : 'Incorrect'}
                         </span>
                       )}
                       <span className="px-4 py-1.5 bg-slate-50 text-slate-400 border border-slate-100 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          {resp.maxMarks} Marks Max
                       </span>
                    </div>
                  </div>

                  <h4 className={`text-lg font-bold mb-8 leading-relaxed ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{resp.question}</h4>

                  <div className="space-y-6">
                    {/* Student's Answer Box */}
                    <div className="space-y-2">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Student Answer</p>
                       {resp.studentAnswer ? (
                         <div className={`p-6 rounded-[1.5rem] border-2 ${resp.type === 'MCQ' ? (resp.marks > 0 ? 'border-emerald-50 bg-emerald-50/30' : 'border-rose-50 bg-rose-50/30') : theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                            <p className={`text-sm leading-relaxed ${resp.type === 'DESC' ? (theme === 'dark' ? 'font-medium italic text-slate-300' : 'font-medium italic text-slate-700') : (theme === 'dark' ? 'font-bold text-white' : 'font-bold text-slate-800')}`}>
                               {resp.type === 'MCQ' ? (resp.marks > 0 ? <CheckCircle2 className="inline mr-2 text-emerald-500" size={16} /> : <XCircle className="inline mr-2 text-rose-500" size={16} />) : null}
                               {resp.studentAnswer}
                            </p>
                         </div>
                       ) : (
                         <div className={`p-6 rounded-[1.5rem] border-2 ${theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-100'}`}>
                            <p className="text-sm font-bold text-slate-400 flex items-center gap-2">
                               <XCircle className="text-slate-400" size={16} />
                               Not Attempted
                            </p>
                         </div>
                       )}
                    </div>

                    {/* Marking / Grading Area */}
                    <div className={`flex flex-col sm:flex-row items-end sm:items-center justify-between gap-6 pt-4 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-50'}`}>
                       <div className="flex-1">
                          {resp.type === 'MCQ' && (resp.marks === 0 || !resp.studentAnswer) && resp.correctAnswer && (
                            <p className="text-xs font-bold text-emerald-600">Correct Answer: <span className="underline">{resp.correctAnswer}</span></p>
                          )}
                          {resp.type === 'DESC' && (
                             <div className="flex items-center gap-2 text-indigo-500">
                                <MessageSquare size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Requires Manual Evaluation</span>
                             </div>
                          )}
                       </div>
                       
                       <div className="flex items-center gap-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign Marks:</label>
                          <div className="relative">
                            <input 
                              type="number"
                              disabled={resp.type === 'MCQ'}
                              className={`w-24 p-3 pr-8 rounded-xl border-2 font-black text-center outline-none transition-all ${resp.type === 'MCQ' ? (theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed' : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed') : (theme === 'dark' ? 'bg-slate-800 border-indigo-500/30 text-indigo-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5' : 'bg-white border-indigo-100 text-indigo-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5')}`}
                              value={manualGrades[resp.id] || 0}
                              onChange={(e) => handleMarkChange(resp.id, e.target.value, resp.maxMarks)}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300">/{resp.maxMarks}</span>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Score Summary Card */}
          <div className="lg:col-span-4 sticky top-12 space-y-6">
            <div className={`rounded-[3rem] p-8 md:p-10 shadow-2xl border relative overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white shadow-indigo-900/20' : 'bg-slate-900 border-slate-800 text-white shadow-indigo-100'}`}>
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600 rounded-full blur-[60px] opacity-20 -mr-16 -mt-16" />
               
               <h3 className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-10">Live Grade Output</h3>
               
               <div className="space-y-8 mb-10">
                  <div className="flex items-center justify-between">
                     <span className="text-slate-400 font-bold">Auto-Graded MCQs</span>
                     <span className="font-black">{(data.responses.filter(r => r.type === 'MCQ').reduce((a, b) => a + (b.marks || 0), 0))} / {(data.responses.filter(r => r.type === 'MCQ').reduce((a, b) => a + b.maxMarks, 0))}</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-slate-400 font-bold">Manual Grades</span>
                     <span className="font-black text-indigo-400">
                        {Object.keys(manualGrades).filter(id => data.responses.find(r => r.id === Number(id)).type === 'DESC').reduce((a, b) => a + manualGrades[b], 0)} / 
                        {data.responses.filter(r => r.type === 'DESC').reduce((a, b) => a + b.maxMarks, 0)}
                     </span>
                  </div>
                  <div className="h-px bg-slate-800" />
                  <div className="flex items-center justify-between">
                     <span className="text-xl font-black">Final Total</span>
                     <div className="text-right">
                        <p className="text-4xl font-black tracking-tighter text-indigo-400">{totalScore}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">out of {totalPossible}</p>
                     </div>
                  </div>
               </div>

               <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:bg-slate-700"
               >
                  {isSaving ? "Saving..." : "Commit Grades"}
               </button>
            </div>

            {/* Quick Navigation / Checklist */}
            <div className={`rounded-[2.5rem] p-8 border shadow-sm ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'}`}>
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Review Checklist</h4>
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="w-5 h-5 rounded-full border-2 border-emerald-500 flex items-center justify-center text-emerald-500">
                        <CheckCircle2 size={12} />
                     </div>
                     <span className={`text-xs font-bold line-through opacity-50 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Verify Identity</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="w-5 h-5 rounded-full border-2 border-indigo-500 flex items-center justify-center text-indigo-500">
                        <Clock size={12} />
                     </div>
                     <span className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Review Integrity Flags</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${totalScore > 0 ? 'border-emerald-500 text-emerald-500' : 'border-slate-200 text-slate-200'}`}>
                        <FileText size={12} />
                     </div>
                     <span className={`text-xs font-bold ${totalScore > 0 ? (theme === 'dark' ? 'text-white' : 'text-slate-800') : 'text-slate-400'}`}>Grade Descriptive Tasks</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Internal Loader
const Loader2 = ({ className, size }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);



export default SubmissionDetailContent;