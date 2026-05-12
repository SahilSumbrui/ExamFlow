import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../App';
import { getTeacherExams } from '../../api/teacherApi';
import TeacherSidebar from '../../components/TeacherSidebar';
import { ArrowLeft } from 'lucide-react';
import API from '../../api/axios';
import {
  Plus,
  Clock,
  Users,
  FileText,
  ChevronRight,
  Loader2,
  ClipboardList,
  Calendar,
  Activity,
  LayoutDashboard,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';

const MyExams = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const { teacherId } = useParams();
  const isAdminView = !!teacherId;
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teacherName, setTeacherName] = useState('');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      if (isAdminView) {
        const response = await API.get(`/admin/teacher/${teacherId}/exams`);
        setExams(response.data.exams || []);
        setTeacherName(response.data.teacher_name || 'Teacher');
      } else {
        const response = await getTeacherExams();
        setExams(response.data);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const start = new Date(exam.start_time);
    const end = new Date(exam.end_time);
    
    if (now < start) return { label: 'Upcoming', color: 'bg-blue-100 text-blue-600 border-blue-200' };
    if (now >= start && now <= end) return { label: 'Live', color: 'bg-emerald-100 text-emerald-600 border-emerald-200' };
    return { label: 'Ended', color: 'bg-slate-100 text-slate-600 border-slate-200' };
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0b0f1a]' : 'bg-slate-50'}`}>
      {!isAdminView && <TeacherSidebar />}

      <div className={`${isAdminView ? 'p-6 md:p-8 lg:p-12' : 'lg:pl-64 pt-20 md:pt-20 lg:pt-0 p-6 md:p-8 lg:pl-72 lg:pr-8'}`}>
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            {isAdminView && (
              <button 
                onClick={() => navigate('/admin/dashboard')}
                className={`p-3 border rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h2 className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {isAdminView ? `${teacherName}'s Examinations` : 'My Examinations'}
              </h2>
              <p className="text-slate-500 font-medium">{isAdminView ? 'View-only' : 'Manage all your assessments'}</p>
            </div>
          </div>
          {!isAdminView && (
            <button 
              onClick={() => navigate('/teacher/dashboard')}
              className={`flex items-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl ${
                theme === 'dark' ? 'shadow-indigo-500/20' : 'shadow-indigo-200'
              }`}
            >
              <Plus size={20} /> Create New Exam
            </button>
          )}
        </header>

        {/* Exams List */}
        {loading ? (
          <div className={`rounded-[3rem] border shadow-sm p-20 text-center ${
            theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <Loader2 className="animate-spin mx-auto text-indigo-600 mb-4" size={40} />
            <p className="text-slate-400 font-medium">Loading exams...</p>
          </div>
        ) : exams.length === 0 ? (
          <div className={`rounded-[3rem] border shadow-sm p-20 text-center ${
            theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <ClipboardList className="mx-auto text-slate-200 mb-4" size={48} />
            <h3 className={`font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>No Exams Yet</h3>
            <p className="text-slate-400 text-sm mb-6">Create your first exam to get started.</p>
            {!isAdminView && (
              <button 
                onClick={() => navigate('/teacher/dashboard')}
                className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
              >
                Create Exam
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {exams.map((exam) => {
              const status = getExamStatus(exam);
              return (
                <div 
                  key={exam.exam_id}
                  className={`rounded-[2.5rem] border shadow-sm p-8 transition-all group cursor-pointer ${
                    theme === 'dark' ? 'bg-[#161b2b] border-slate-800 hover:border-indigo-500' : 'bg-white border-slate-200 hover:border-indigo-200'
                  }`}
                  onClick={() => navigate(isAdminView ? `/admin/teacher/${teacherId}/exam/${exam.exam_id}` : `/teacher/exam/${exam.exam_id}`)}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`text-2xl font-black group-hover:text-indigo-600 transition-colors ${
                          theme === 'dark' ? 'text-white' : 'text-slate-900'
                        }`}>
                          {exam.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-slate-500 font-medium text-sm">
                        Exam Code: <span className={`font-bold font-mono ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{exam.exam_code}</span>
                      </p>
                    </div>
                    <ChevronRight className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" size={24} />
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-indigo-600 ${
                        theme === 'dark' ? 'bg-indigo-500/20' : 'bg-indigo-50'
                      }`}>
                        <Clock size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                        <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{exam.duration_minutes}m</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-emerald-600 ${
                        theme === 'dark' ? 'bg-emerald-500/20' : 'bg-emerald-50'
                      }`}>
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Marks</p>
                        <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{exam.total_marks}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-blue-600 ${
                        theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-50'
                      }`}>
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start</p>
                        <p className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{new Date(exam.start_time).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-rose-600 ${
                        theme === 'dark' ? 'bg-rose-500/20' : 'bg-rose-50'
                      }`}>
                        <Activity size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End</p>
                        <p className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{new Date(exam.end_time).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyExams;
