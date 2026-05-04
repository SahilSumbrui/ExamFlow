import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate} from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../App';
import { deleteQuestion as deleteQuestionApi } from '../../api/questionApi';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  BarChart3, 
  LogOut, 
  ChevronRight,
  Plus,
  ArrowLeft,
  Settings,
  Eye,
  Trash2,
  Edit3,
  CheckCircle,
  Clock,
  FileText,
  AlertCircle,
  Share2,
  GanttChartSquare,
  Globe,
  Menu,
  X
} from 'lucide-react';

/**
 * MOCK DATA FETCH
 */
const getMockExam = (id) => ({
  id: id,
  title: "Advanced Systems Programming",
  course_id: "CS-402",
  duration_minutes: 90,
  status: "DRAFT", 
  created_at: "2025-10-01",
  questions: [
    { id: 1, text: "Which system call is used to create a new process in Unix?", type: "MCQ", marks: 5 },
    { id: 2, text: "Describe the lifecycle of a zombie process and how to prevent it.", type: "DESC", marks: 15 },
    { id: 3, text: "Explain the difference between Hard Links and Soft Links.", type: "DESC", marks: 10 }
  ],
  submissionsCount: 124
});

import API from '../../api/axios';

const ExamDetailsContent = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme } = useTheme();
  
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', end_time: '', duration_minutes: '' });
  const [isPublishingResults, setIsPublishingResults] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchedExam = async () => {
        try{
          const res = await API.get(`/exams/${examId}`);
          const data = res.data;
          setExam(data);
        } catch (error) {
          console.error("Error fetching exam:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchedExam();
    }, 600);
    return () => clearTimeout(timer);
  }, [examId]);

  const totalMarks = useMemo(() => {
    if (!exam) return 0;
    return exam.questions.reduce((acc, q) => acc + q.marks, 0);
  }, [exam]);

  const toggleStatus = async () => {
    const newStatus = exam.status === 'DRAFT' ? 'PUBLISHED' : 'DRAFT';
    try {
      await API.put(`/exams/${examId}/status`, { status: newStatus });
      setExam(prev => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update exam status');
    }
  };

  const handleEditExam = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: editForm.title,
        end_time: editForm.end_time.replace('T', ' ') + ':00',
        duration_minutes: parseInt(editForm.duration_minutes)
      };
      
      await API.put(`/exams/${examId}`, payload);
      
      setExam(prev => ({ ...prev, ...payload }));
      setShowEditModal(false);
      alert('Exam updated successfully!');
    } catch (error) {
      console.error('Error updating exam:', error);
      alert('Failed to update exam: ' + error.message);
    }
  };

  const handlePublishResults = async () => {
    const action = exam.results_published ? 'unpublish' : 'publish';
    if (!window.confirm(`${action === 'publish' ? 'Publish' : 'Unpublish'} results? Students will ${action === 'publish' ? 'be able to' : 'no longer'} view their scores.`)) return;
    
    setIsPublishingResults(true);
    try {
      await API.post('/exams/publish-results', { exam_id: examId, publish: !exam.results_published });
      setExam(prev => ({ ...prev, results_published: !prev.results_published }));
      alert(`Results ${action}ed successfully!`);
    } catch (error) {
      console.error('Error publishing results:', error);
      alert(`Failed to ${action} results`);
    } finally {
      setIsPublishingResults(false);
    }
  };

  const deleteQuestion = async (qId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    
    try {
      await deleteQuestionApi(qId);
      setExam(prev => ({
        ...prev,
        questions: prev.questions.filter(q => q.question_id !== qId)
      }));
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Failed to delete question');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <div className={`h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#0b0f1a]' : 'bg-slate-50'}`}>
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0b0f1a] text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Main Workspace */}
      <main className="p-6 md:p-8 lg:p-12 space-y-10">
        {/* Navigation / Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <button onClick={() => navigate('/teacher/dashboard', { replace: true })} className={`p-3 border rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm ${
              theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            }`}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{exam.title}</h2>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${exam.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-amber-100 text-amber-600 border border-amber-200'}`}>
                  {exam.status}
                </span>
              </div>
              <p className="text-slate-500 font-medium text-sm">Course ID: <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{exam.course_id}</span></p>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => {
                // Format datetime for datetime-local input without timezone conversion
                const formatDateTimeLocal = (dateStr) => {
                  if (!dateStr) return '';
                  const date = new Date(dateStr);
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  const hours = String(date.getHours()).padStart(2, '0');
                  const minutes = String(date.getMinutes()).padStart(2, '0');
                  return `${year}-${month}-${day}T${hours}:${minutes}`;
                };
                
                setEditForm({ 
                  title: exam.title, 
                  end_time: formatDateTimeLocal(exam.end_time), 
                  duration_minutes: exam.duration_minutes 
                });
                setShowEditModal(true);
              }}
              className={`px-6 py-4 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 ${
                theme === 'dark' ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Edit3 size={18} /> Edit Exam
            </button>
            <button 
              onClick={toggleStatus}
              className={`flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all shadow-xl ${
                exam.status === 'PUBLISHED' 
                  ? theme === 'dark' ? 'bg-amber-500 text-white shadow-amber-500/20' : 'bg-amber-500 text-white shadow-amber-200'
                  : theme === 'dark' ? 'bg-indigo-600 text-white shadow-indigo-500/20 hover:bg-indigo-700' : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700'
              }`}
            >
              {exam.status === 'PUBLISHED' ? <AlertCircle size={18} /> : <Globe size={18} />}
              {exam.status === 'PUBLISHED' ? 'Unpublish' : 'Publish Exam'}
            </button>
          </div>
        </header>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={`p-6 rounded-[2rem] border shadow-sm ${
            theme === 'dark' ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100'
          }`}>
            <div className="flex items-center gap-3 text-indigo-600 mb-3">
              <Clock size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duration</span>
            </div>
            <p className="text-2xl font-black text-indigo-600">{exam.duration_minutes}m</p>
          </div>
          <div className={`p-6 rounded-[2rem] border shadow-sm ${
            theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-gradient-to-br from-emerald-50 to-white border-emerald-100'
          }`}>
            <div className="flex items-center gap-3 text-emerald-600 mb-3">
              <CheckCircle size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Weight</span>
            </div>
            <p className="text-2xl font-black text-emerald-600">{totalMarks} Marks</p>
          </div>
          <div className={`p-6 rounded-[2rem] border shadow-sm ${
            theme === 'dark' ? 'bg-purple-500/10 border-purple-500/20' : 'bg-gradient-to-br from-purple-50 to-white border-purple-100'
          }`}>
            <div className="flex items-center gap-3 text-purple-600 mb-3">
              <FileText size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Questions</span>
            </div>
            <p className="text-2xl font-black text-purple-600">{exam.questions.length}</p>
          </div>
          <div className={`p-6 rounded-[2rem] border shadow-sm ${
            theme === 'dark' ? 'bg-blue-500/10 border-blue-500/20' : 'bg-gradient-to-br from-blue-50 to-white border-blue-100'
          }`}>
            <div className="flex items-center gap-3 text-blue-600 mb-3">
              <Users size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Submissions</span>
            </div>
            <p className="text-2xl font-black text-blue-600">{exam.submissionsCount}</p>
          </div>
        </div>

        {/* Questions Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className={`text-xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Question Pool</h3>
            <button 
              onClick={() => navigate('/teacher/builder', { state: { examId } })}
              className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:underline"
            >
              <Plus size={18} /> <span className="hidden sm:inline">Add Question</span>
            </button>
          </div>

          <div className={`rounded-[2rem] md:rounded-[3rem] border shadow-sm overflow-x-auto ${
            theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className={theme === 'dark' ? 'bg-slate-800/30' : 'bg-slate-50/50'}>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">#</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Question Context</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Type</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Marks</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {exam.questions.map((q, idx) => (
                  <tr key={q.question_id} className={`group transition-all ${theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/50'}`}>
                    <td className="p-6 font-black text-slate-300">{(idx + 1).toString().padStart(2, '0')}</td>
                    <td className="p-6 max-w-xs md:max-w-md">
                      <p className={`font-bold truncate group-hover:text-indigo-600 transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{q.question_text}</p>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase ${q.type === 'MCQ' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                        {q.type}
                      </span>
                    </td>
                    <td className={`p-6 text-center font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{q.marks}</td>
                    <td className="p-6 text-right space-x-2">
                      <button onClick={() => navigate(`/teacher/builder/${q.question_id}`, {state: {examId}})}className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit3 size={18} /></button>
                      <button onClick={() => deleteQuestion(q.question_id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {exam.questions.length === 0 && (
              <div className="p-20 text-center">
                <GanttChartSquare className="text-slate-200 mx-auto mb-4" size={48} />
                <h4 className={`font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>No Questions Added</h4>
                <p className="text-slate-400 text-sm mb-6">Start building your assessment pool.</p>
                <button onClick={() => navigate('/teacher/builder', { state: { examId } })} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Enter Builder</button>
              </div>
            )}
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
           <button 
             onClick={() => navigate(`/teacher/submissions/${examId}`)}
             className={`flex-1 py-5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] hover:from-indigo-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95 ${
               theme === 'dark' ? 'shadow-indigo-500/20' : 'shadow-indigo-200'
             }`}
           >
              <Eye size={18} /> View Submissions
           </button>
           <button 
             onClick={handlePublishResults}
             disabled={isPublishingResults}
             className={`flex-1 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95 ${
               exam.results_published 
                 ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                 : theme === 'dark' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-emerald-600 text-white hover:bg-emerald-700'
             }`}
           >
              <CheckCircle size={18} /> {isPublishingResults ? 'Processing...' : exam.results_published ? 'Unpublish Results' : 'Publish Results'}
           </button>
           <button 
             onClick={() => setShowShareModal(true)}
             className={`flex-1 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95 ${
               theme === 'dark' ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
             }`}
           >
              <Share2 size={18} /> Share with Students
           </button>
        </div>
      </main>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
          <div className={`rounded-[3rem] p-10 w-full max-w-md shadow-2xl ${
            theme === 'dark' ? 'bg-[#161b2b]' : 'bg-white'
          }`}>
            <div className="flex justify-between items-start mb-6">
              <h3 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Edit Exam</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditExam} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Exam Title</label>
                <input 
                  type="text" 
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className={`w-full p-4 border rounded-2xl font-medium ${
                    theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">End Time</label>
                <input 
                  type="datetime-local" 
                  required
                  value={editForm.end_time}
                  onChange={(e) => setEditForm({...editForm, end_time: e.target.value})}
                  className={`w-full p-4 border rounded-2xl font-medium ${
                    theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Duration (minutes)</label>
                <input 
                  type="number" 
                  required
                  value={editForm.duration_minutes}
                  onChange={(e) => setEditForm({...editForm, duration_minutes: e.target.value})}
                  className={`w-full p-4 border rounded-2xl font-medium ${
                    theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
              <button 
                type="submit"
                className="w-full mt-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
          <div className={`rounded-[3rem] p-10 w-full max-w-md shadow-2xl ${
            theme === 'dark' ? 'bg-[#161b2b]' : 'bg-white'
          }`}>
            <div className="flex justify-between items-start mb-6">
              <h3 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Share Exam</h3>
              <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={20} />
              </button>
            </div>
            <p className="text-slate-500 text-sm mb-8">Share these credentials with students to join the exam.</p>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-2xl border ${
                theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Exam ID</p>
                <p className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{exam.exam_id}</p>
              </div>
              <div className={`p-4 rounded-2xl border ${
                theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Exam Code</p>
                <p className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{exam.exam_code}</p>
              </div>
            </div>

            <button 
              onClick={() => {
                navigator.clipboard.writeText(`Exam ID: ${exam.exam_id}\nExam Code: ${exam.exam_code}`);
                alert('Copied to clipboard!');
              }}
              className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-600 transition"
            >
              Copy Credentials
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Internal Components
const Loader2 = ({ className, size }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);


export default ExamDetailsContent;