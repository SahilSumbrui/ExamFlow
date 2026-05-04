import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../App';
import { 
  ArrowLeft,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  Download,
  User,
  BarChart3
} from 'lucide-react';

import API from '../../api/axios';

const SubmissionsContent = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, [examId]);

  const fetchSubmissions = async () => {
    try {
      const [submissionsRes, examRes, descriptiveRes] = await Promise.all([
        API.get(`/exams/${examId}/results`),
        API.get(`/exams/${examId}`),
        API.get(`/tests/descriptive/${examId}`)
      ]);
      const submissions = submissionsRes.data;
      const examData = examRes.data;
      const descriptiveAnswers = descriptiveRes.data;
      
      const uncheckedAttempts = new Set(
        descriptiveAnswers
          .filter(d => d.marks_awarded === null)
          .map(d => d.attempt_id)
      );

      setData({
        examTitle: examData.title,
        courseId: examData.course_id,
        totalPossibleMarks: examData.total_marks,
        students: submissions.map(s => ({
          id: s.attempt_id,
          name: s.student_name,
          status: s.status === 'COMPLETED' || s.status === 'AUTO_SUBMITTED' ? 'Submitted' : 'Pending',
          score: s.score,
          submittedAt: s.end_time ? new Date(s.end_time).toLocaleTimeString() : null,
          needsGrading: uncheckedAttempts.has(s.attempt_id)
        }))
      });
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    if (!data) return [];
    return data.students.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const stats = useMemo(() => {
    if (!data || !data.students || data.students.length === 0) return { avg: 0, rate: 0, total: 0, submittedCount: 0, pending: 0 };
    const submitted = data.students.filter(s => s.status === 'Submitted');
    const pending = data.students.filter(s => s.status === 'Pending');
    const avg = submitted.length > 0 
      ? (submitted.reduce((acc, s) => acc + s.score, 0) / submitted.length).toFixed(1)
      : 0;
    const rate = data.students.length > 0 ? Math.round((submitted.length / data.students.length) * 100) : 0;
    return { avg, rate, total: data.students.length, submittedCount: submitted.length, pending: pending.length };
  }, [data]);

  if (loading) return (
    <div className={`h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#0b0f1a]' : 'bg-slate-50'}`}>
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className={`min-h-screen font-sans ${theme === 'dark' ? 'bg-[#0b0f1a] text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Main Content */}
      <main className="p-4 md:p-8 lg:p-12 space-y-8">
        {/* Breadcrumb Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(`/teacher/exam/${examId}`, { replace: true })} className={`p-2.5 border rounded-xl shadow-sm transition-all shrink-0 ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-900'}`}>
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <h2 className={`text-xl md:text-2xl lg:text-3xl font-black tracking-tight truncate ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Submissions</h2>
              <p className="text-slate-500 font-medium text-xs md:text-sm truncate">
                {data.examTitle} <span className="text-slate-300 mx-1">•</span> {data.courseId}
              </p>
            </div>
          </div>
          <button className={`hidden sm:flex items-center gap-2 px-5 py-2.5 border rounded-xl font-bold text-xs transition-all shadow-sm ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800 text-slate-400 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <Download size={14} /> Export
          </button>
        </header>

        {/* Responsive Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className={`p-6 lg:p-8 rounded-[2rem] border shadow-sm ${
            theme === 'dark' ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100'
          }`}>
            <div className="flex items-center gap-3 text-indigo-600 mb-2">
              <CheckCircle2 size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Submission Rate</span>
            </div>
            <p className="text-2xl lg:text-3xl font-black text-indigo-600">{stats.rate}% <span className="text-xs font-medium text-slate-400">({stats.submittedCount}/{stats.total})</span></p>
          </div>
          <div className={`p-6 lg:p-8 rounded-[2rem] border shadow-sm ${
            theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-gradient-to-br from-emerald-50 to-white border-emerald-100'
          }`}>
            <div className="flex items-center gap-3 text-emerald-600 mb-2">
              <BarChart3 size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Average Grade</span>
            </div>
            <p className="text-2xl lg:text-3xl font-black text-emerald-600">{stats.avg} <span className="text-xs font-medium text-slate-400">pts</span></p>
          </div>
          <div className={`p-6 lg:p-8 rounded-[2rem] border shadow-sm sm:col-span-2 lg:col-span-1 ${
            theme === 'dark' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-gradient-to-br from-amber-50 to-white border-amber-100'
          }`}>
            <div className="flex items-center gap-3 text-amber-500 mb-2">
              <Clock size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Action Required</span>
            </div>
            <p className="text-2xl lg:text-3xl font-black text-amber-600">{stats.pending} <span className="text-xs font-medium text-slate-400">Pending</span></p>
          </div>
        </div>

        {/* Search and Table */}
        <div className="space-y-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search students..."
              className={`w-full pl-11 pr-4 py-3.5 border rounded-2xl outline-none focus:border-indigo-500 transition-all font-medium text-sm shadow-sm ${
                theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Fluid Table Container - No horizontal scroll on tablet/desktop */}
          <div className={`rounded-[2.5rem] border overflow-hidden shadow-sm ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="overflow-x-auto lg:overflow-visible">
              <table className="w-full text-left border-collapse table-auto lg:table-fixed">
                <thead className="hidden sm:table-header-group">
                  <tr className={theme === 'dark' ? 'bg-slate-800/30' : 'bg-slate-50/50'}>
                    <th className={`p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b lg:w-1/3 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>Student</th>
                    <th className={`p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b lg:w-1/6 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>Status</th>
                    <th className={`p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b text-center lg:w-1/6 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>Score</th>
                    <th className={`p-5 hidden md:table-cell text-[10px] font-black text-slate-400 uppercase tracking-widest border-b lg:w-1/6 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>Time</th>
                    <th className={`p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b text-right lg:w-1/6 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-800' : 'divide-slate-50'}`}>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className={`group transition-all flex flex-col sm:table-row p-4 sm:p-0 ${theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/50'}`}>
                      <td className="sm:p-5 mb-3 sm:mb-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${theme === 'dark' ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                            <User size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className={`font-bold text-sm truncate ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{student.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">{student.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="sm:p-5 mb-2 sm:mb-0">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                            student.status === 'Submitted' 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                              : 'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                            {student.status}
                          </span>
                          {student.needsGrading && (
                            <span className="px-2 py-1 rounded-full text-[8px] font-black uppercase bg-orange-100 text-orange-600 border border-orange-200">
                              Needs Grading
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="sm:p-5 sm:text-center mb-2 sm:mb-0 flex sm:table-cell items-center gap-2">
                        <span className="sm:hidden text-[10px] font-black text-slate-400 uppercase">Score:</span>
                        <p className={`text-sm font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                          {student.score !== null ? `${student.score}/${data.totalPossibleMarks}` : '—'}
                        </p>
                      </td>
                      <td className="sm:p-5 hidden md:table-cell">
                        <p className="text-xs font-bold text-slate-500 whitespace-nowrap">
                          {student.submittedAt || '—'}
                        </p>
                      </td>
                      <td className="sm:p-5 sm:text-right mt-2 sm:mt-0">
                        <button 
                          disabled={student.status !== 'Submitted'}
                          onClick={() => navigate(`/teacher/submission/${student.id}`)}
                          className={`w-full sm:w-auto px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-sm inline-flex items-center justify-center gap-2 ${
                            student.status === 'Submitted'
                              ? 'bg-slate-900 text-white hover:bg-indigo-600'
                              : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                          }`}
                        >
                          <Eye size={14} /> Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredStudents.length === 0 && (
                <div className={`p-16 text-center font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>No students found.</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubmissionsContent;