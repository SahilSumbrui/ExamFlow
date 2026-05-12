import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../App';
import { 
  ArrowLeft,
  Clock,
  CheckCircle,
  FileText,
  Users,
  Eye,
  Loader2
} from 'lucide-react';
import API from '../../api/axios';

const AdminExamOversight = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchExam = async () => {
        try {
          const res = await API.get(`/exams/${examId}`);
          console.log('Exam response:', res.data);
          setExam(res.data);
          setError(null);
        } catch (err) {
          console.error("Error fetching exam:", err);
          setError(err.response?.data?.message || 'Failed to load exam');
          setExam(null);
        } finally {
          setLoading(false);
        }
      };
      fetchExam();
    }, 600);
    return () => clearTimeout(timer);
  }, [examId]);

  const totalMarks = useMemo(() => {
    if (!exam || !exam.questions) return 0;
    return exam.questions.reduce((acc, q) => acc + q.marks, 0);
  }, [exam]);

  if (loading) {
    return (
      <div className={`h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#0b0f1a]' : 'bg-slate-50'}`}>
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className={`h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#0b0f1a]' : 'bg-slate-50'}`}>
        <div className="text-center">
          <p className="text-rose-500 font-bold mb-4">{error || 'Exam not found'}</p>
          <button onClick={() => navigate('/admin/dashboard')} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0b0f1a] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <main className="p-6 md:p-8 lg:p-12 space-y-10">
        
        {/* Header */}
        <header className="flex items-center gap-5">
          <button 
            onClick={() => navigate('/admin/dashboard')} 
            className={`p-3 border rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {exam.title}
              </h2>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${exam.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-amber-100 text-amber-600 border border-amber-200'}`}>
                {exam.status}
              </span>
            </div>
            <p className="text-slate-500 font-medium text-sm">
              Instructor: <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{exam.teacher_name || 'Unknown'}</span>
            </p>
          </div>
        </header>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={`p-6 rounded-[2rem] border shadow-sm ${theme === 'dark' ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100'}`}>
            <div className="flex items-center gap-3 text-indigo-600 mb-3">
              <Clock size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duration</span>
            </div>
            <p className="text-2xl font-black text-indigo-600">{exam.duration_minutes}m</p>
          </div>
          <div className={`p-6 rounded-[2rem] border shadow-sm ${theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-gradient-to-br from-emerald-50 to-white border-emerald-100'}`}>
            <div className="flex items-center gap-3 text-emerald-600 mb-3">
              <CheckCircle size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Marks</span>
            </div>
            <p className="text-2xl font-black text-emerald-600">{totalMarks}</p>
          </div>
          <div className={`p-6 rounded-[2rem] border shadow-sm ${theme === 'dark' ? 'bg-purple-500/10 border-purple-500/20' : 'bg-gradient-to-br from-purple-50 to-white border-purple-100'}`}>
            <div className="flex items-center gap-3 text-purple-600 mb-3">
              <FileText size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Questions</span>
            </div>
            <p className="text-2xl font-black text-purple-600">{exam.questions ? exam.questions.length : 0}</p>
          </div>
          <div className={`p-6 rounded-[2rem] border shadow-sm ${theme === 'dark' ? 'bg-blue-500/10 border-blue-500/20' : 'bg-gradient-to-br from-blue-50 to-white border-blue-100'}`}>
            <div className="flex items-center gap-3 text-blue-600 mb-3">
              <Users size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Submissions</span>
            </div>
            <p className="text-2xl font-black text-blue-600">{exam.submissionsCount || 0}</p>
          </div>
        </div>

        {/* Questions Section - Read Only */}
        <div className="space-y-6">
          <h3 className={`text-xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Question Pool</h3>

          {exam.questions && exam.questions.length > 0 ? (
            <div className={`rounded-[2rem] md:rounded-[3rem] border shadow-sm overflow-x-auto ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'}`}>
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className={theme === 'dark' ? 'bg-slate-800/30' : 'bg-slate-50/50'}>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">#</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Question</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Type</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {exam.questions.map((q, idx) => (
                    <tr key={q.question_id} className={`transition-all ${theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/50'}`}>
                      <td className="p-6 font-black text-slate-300">{(idx + 1).toString().padStart(2, '0')}</td>
                      <td className="p-6 max-w-xs md:max-w-md">
                        <p className={`font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{q.question_text}</p>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase ${q.type === 'MCQ' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                          {q.type}
                        </span>
                      </td>
                      <td className={`p-6 text-center font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{q.marks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={`p-12 rounded-[2rem] text-center ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'} border`}>
              <p className="text-slate-400 font-bold">No questions added to this exam</p>
            </div>
          )}
        </div>

        {/* View Submissions Button */}
        <div className="pt-6">
          <button 
            onClick={() => navigate(`/admin/exam-submissions/${examId}`)}
            className={`w-full py-5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] hover:from-indigo-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95 ${theme === 'dark' ? 'shadow-indigo-500/20' : 'shadow-indigo-200'}`}
          >
            <Eye size={18} /> View & Review Submissions
          </button>
        </div>
      </main>
    </div>
  );
};

export default AdminExamOversight;
