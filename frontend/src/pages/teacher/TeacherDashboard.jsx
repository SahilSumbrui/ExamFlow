import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../App";
import { getTeacherStats, getTeacherExams } from "../../api/teacherApi";
import { createExam } from "../../api/examApi";
import TeacherSidebar from "../../components/TeacherSidebar";
import { 
  Plus, 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  LogOut, 
  ChevronRight,
  ClipboardList,
  Loader2,
  Settings,
  CheckCircle2
} from 'lucide-react';         
const createExamMock = async (examData) => {
  console.log("Submitting to API:", examData);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    data: {
      message: "Exam created successfully",
      exam_id: Math.floor(Math.random() * 1000),
      exam_code: Math.random().toString(36).substring(2, 8).toUpperCase()
    }
  };
};

// Internal X Icon Component to avoid resolution errors
const XIcon = ({ className, size }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const TeacherDashContent = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [stats, setStats] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [examForm, setExamForm] = useState({
    title: '',
    course_id: '',
    duration_minutes: 60,
    total_marks: 100,
    start_time: '',
    end_time: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, examsRes] = await Promise.all([
        getTeacherStats(),
        getTeacherExams()
      ]);
      setStats(statsRes.data);
      setExams(examsRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await createExam(examForm);
      setSuccessData(res.data);
      setExamForm({
        title: '',
        course_id: '',
        duration_minutes: 60,
        total_marks: 100,
        start_time: '',
        end_time: ''
      });
      fetchDashboardData(); // Refresh exam list
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create exam');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = (e) => {
    if (e) e.preventDefault();
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0b0f1a] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <TeacherSidebar />

      <main className="lg:pl-64 pt-20 md:pt-20 lg:pt-0 p-6 md:p-8 lg:pl-72 lg:pr-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className={`text-4xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {user?.role === 'ADMIN' ? 'Admin Controller' : 'Instructor Dashboard'}
            </h2>
            <p className="text-slate-500 font-medium">Greetings, <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{user?.name}</span></p>
          </div>
          <button 
            type="button"
            onClick={() => {
              setSuccessData(null);
              setShowCreateModal(true);
            }}
            className={`bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] font-bold flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-xl active:scale-95 ${
              theme === 'dark' ? 'shadow-indigo-500/20' : 'shadow-indigo-200'
            }`}
          >
            <Plus size={20} /> <span>Create New Exam</span>
          </button>
        </header>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {loading ? (
            <div className={`col-span-3 p-20 rounded-[2.5rem] border text-center ${
              theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <Loader2 className="animate-spin mx-auto text-indigo-600 mb-4" size={40} />
              <p className="text-slate-400 font-medium">Loading dashboard...</p>
            </div>
          ) : (
            <>
              <div className={`p-8 rounded-[2.5rem] border shadow-sm ${
                theme === 'dark' ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100'
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-indigo-600 mb-4 ${
                  theme === 'dark' ? 'bg-indigo-500/20' : 'bg-indigo-100'
                }`}>
                  <ClipboardList size={20} />
                </div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Active Exams</p>
                <p className="text-4xl font-black text-indigo-600">{stats?.activeExams || 0}</p>
              </div>
              <div className={`p-8 rounded-[2.5rem] border shadow-sm ${
                theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-gradient-to-br from-emerald-50 to-white border-emerald-100'
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-emerald-600 mb-4 ${
                  theme === 'dark' ? 'bg-emerald-500/20' : 'bg-emerald-100'
                }`}>
                  <Users size={20} />
                </div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Submissions</p>
                <p className="text-4xl font-black text-emerald-600">{stats?.totalSubmissions || 0}</p>
              </div>
              <div className={`p-8 rounded-[2.5rem] border shadow-sm ${
                theme === 'dark' ? 'bg-purple-500/10 border-purple-500/20' : 'bg-gradient-to-br from-purple-50 to-white border-purple-100'
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-purple-600 mb-4 ${
                  theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'
                }`}>
                  <BarChart3 size={20} />
                </div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Avg. Score</p>
                <p className="text-4xl font-black text-purple-600">{stats?.avgScore ? Math.round(stats.avgScore) : 0}%</p>
              </div>
            </>
          )}
        </div>

        {/* Exam List Container */}
        <div className={`rounded-[3rem] border shadow-sm overflow-hidden ${
          theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className={`p-8 border-b flex justify-between items-center ${
            theme === 'dark' ? 'border-slate-800 bg-slate-800/30' : 'border-slate-100 bg-slate-50/50'
          }`}>
            <h3 className={`font-black text-xl tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Recent Examinations</h3>
          </div>
          {loading ? (
            <div className="p-20 text-center">
              <Loader2 className="animate-spin mx-auto text-indigo-600 mb-4" size={40} />
              <p className="text-slate-400 font-medium">Loading exams...</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="p-20 text-center">
              <ClipboardList className="mx-auto text-slate-200 mb-4" size={48} />
              <h3 className="text-slate-800 font-bold mb-2">No Exams Yet</h3>
              <p className="text-slate-400 text-sm">Create your first exam to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {exams.slice(0, 5).map((exam, i) => (
                <div key={exam.exam_id} className={`p-6 flex items-center justify-between transition-all cursor-default group ${
                  theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/80'
                }`}>
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-slate-300 border shadow-sm group-hover:border-indigo-100 group-hover:text-indigo-200 transition-colors ${
                      theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
                    }`}>#{i + 1}</div>
                    <div>
                      <h4 className={`font-bold text-lg group-hover:text-indigo-600 transition-colors tracking-tight ${
                        theme === 'dark' ? 'text-white' : 'text-slate-800'
                      }`}>{exam.title}</h4>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Marks: {exam.total_marks} | Time: {exam.duration_minutes}m</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <button 
                       type="button"
                       onClick={() => navigate(`/teacher/exam/${exam.exam_id}`)}
                       className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-indigo-600 transition-all shadow-md active:scale-95"
                     >
                       Manage Questions
                     </button>
                     <button type="button" onClick={() => navigate(`/teacher/exam/${exam.exam_id}`)} className="p-2 text-slate-200 hover:text-indigo-600 transition-colors"><ChevronRight size={20}/></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Modal Overlay */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`rounded-[3.5rem] p-12 w-full max-w-2xl shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-8 duration-500 ${
            theme === 'dark' ? 'bg-[#161b2b]' : 'bg-white'
          }`}>
             <div className="absolute top-0 left-0 w-full h-3 bg-indigo-600" />
             
             <div className="flex justify-between items-start mb-10">
               <div>
                 <h3 className={`text-3xl font-black mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>New Assessment</h3>
                 <p className="text-slate-500 font-medium">Configure the core metadata for this exam session.</p>
               </div>
               <button 
                type="button"
                onClick={() => setShowCreateModal(false)}
                className={`p-3 rounded-full transition-colors ${
                  theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'
                }`}
               >
                 <XIcon className="text-slate-400" size={20} />
               </button>
             </div>

             {successData ? (
               <div className="text-center py-10 space-y-6 animate-in zoom-in duration-300">
                 <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-100">
                   <CheckCircle2 size={40} />
                 </div>
                 <div className="space-y-2">
                   <h4 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Exam Created Successfully</h4>
                   <p className="text-slate-500">Distribute the access code to your students.</p>
                 </div>
                 <div className={`border p-6 rounded-3xl inline-block px-12 ${
                   theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'
                 }`}>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Access Code</p>
                   <p className="text-4xl font-black text-indigo-600 font-mono tracking-tighter">{successData.exam_code}</p>
                 </div>
                 <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className={`w-full py-5 text-white rounded-[2rem] font-bold transition shadow-xl ${
                    theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-900 hover:bg-slate-800'
                  }`}
                 >
                   Done, Back to Dashboard
                 </button>
               </div>
             ) : (
               <form onSubmit={handleCreateExam} className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block tracking-widest">Exam Title</label>
                     <input type="text" name="title" required className={`w-full p-5 border rounded-[1.5rem] outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium ${
                       theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                     }`} placeholder="e.g. Distributed Systems Mid-Term" value={examForm.title} onChange={e => setExamForm({...examForm, title: e.target.value})} />
                  </div>
                  <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block tracking-widest">Course ID</label>
                     <input type="text" name="course_id" required className={`w-full p-5 border rounded-[1.5rem] outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium ${
                       theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                     }`} placeholder="CS-401" value={examForm.course_id} onChange={e => setExamForm({...examForm, course_id: e.target.value})} />
                  </div>
                  <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block tracking-widest">Duration (Mins)</label>
                     <input type="number" name="duration" required className={`w-full p-5 border rounded-[1.5rem] outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium ${
                       theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                     }`} value={examForm.duration_minutes} onChange={e => setExamForm({...examForm, duration_minutes: Number(e.target.value)})} />
                  </div>
                  <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block tracking-widest">Total Marks</label>
                     <input type="number" name="total_marks" required className={`w-full p-5 border rounded-[1.5rem] outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium ${
                       theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                     }`} value={examForm.total_marks} onChange={e => setExamForm({...examForm, total_marks: Number(e.target.value)})} />
                  </div>
                  <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block tracking-widest">Start Window</label>
                     <input type="datetime-local" name="start_time" required className={`w-full p-5 border rounded-[1.5rem] outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium ${
                       theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                     }`} onChange={e => setExamForm({...examForm, start_time: e.target.value})} />
                  </div>
                  <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block tracking-widest">End Window</label>
                     <input type="datetime-local" name="end_time" required className={`w-full p-5 border rounded-[1.5rem] outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium ${
                       theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                     }`} onChange={e => setExamForm({...examForm, end_time: e.target.value})} />
                  </div>
                  
                  <div className="col-span-2 flex gap-4 mt-8">
                     <button type="button" onClick={() => setShowCreateModal(false)} className={`flex-1 py-5 rounded-[2rem] font-bold transition ${
                       theme === 'dark' ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                     }`}>Discard</button>
                     <button 
                      disabled={isLoading}
                      type="submit"
                      className={`flex-1 py-5 text-white rounded-[2rem] font-bold transition shadow-xl flex items-center justify-center gap-3 ${
                        theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'
                      }`}
                     >
                       {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                       <span>{isLoading ? "Creating..." : "Generate Access Code"}</span>
                     </button>
                  </div>
               </form>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashContent;