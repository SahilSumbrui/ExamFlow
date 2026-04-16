import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../App';

import { 
  LayoutDashboard, 
  ClipboardList, 
  BookOpen, 
  Settings, 
  LogOut, 
  ChevronRight, 
  KeyRound, 
  Loader2,
  CheckCircle2,
  Activity,
  FileText,
  Clock,
  Menu,
  X
} from 'lucide-react';


const startTestMock = async (examData) => {
  console.log("Validating Credentials:", examData);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    data: {
      message: "Session authorized",
      attempt_id: 'att-' + Math.random().toString(36).substring(2, 9)
    }
  };
};

const getAttemptsMock = async () => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return {
    data: [
      { id: '101', title: 'Data Structures Mid-Term', score: 88, date: 'Oct 12, 2025', status: 'GRADED' },
      { id: '102', title: 'System Design Fundamentals', score: 94, date: 'Oct 24, 2025', status: 'GRADED' },
      { id: '103', title: 'Machine Learning Quiz', score: null, date: 'Today', status: 'ONGOING' }
    ]
  };
};

// Internal X Icon Component
const XIcon = ({ className, size }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const StudentDashContent = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [stats, setStats] = useState({ active: 0, completed: 0, avgGrade: 0 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [joinForm, setJoinForm] = useState({
    exam_id: '',
    exam_code: ''
  });

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/students/${user.user_id}/attempts`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setAttempts(data);

      const active = data.filter(a => a.status === 'ONGOING').length;
      const completed = data.filter(a => a.status === 'COMPLETED' || a.status === 'AUTO_SUBMITTED').length;
      
      // Calculate average grade only from published results
      const publishedWithScores = data.filter(a => a.results_published && a.score && a.total_marks);
      const avgGrade = publishedWithScores.length > 0 
        ? Math.round(publishedWithScores.reduce((acc, a) => acc + (a.score / a.total_marks * 100), 0) / publishedWithScores.length)
        : 0;
      
      setStats({ active, completed, avgGrade });
    } catch (error) {
      console.error('Error fetching attempts:', error);
    }
  };

  const handleJoinSession = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/tests/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(joinForm)
      });
      const data = await res.json();
      
      if (res.ok) {
        setShowJoinModal(false);
        navigate(`/student/exam/${data.attempt_id}`);
      } else {
        alert(data.message || 'Failed to join exam');
      }
    } catch (err) {
      console.error(err);
      alert('Error joining exam');
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
      {/* Mobile Header */}
      <header className="lg:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-black text-sm">E</div>
          <h1 className="text-sm font-black tracking-tighter uppercase">ExamFlow</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-400">
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Sidebar - Matches Teacher Dash */}
      <aside className={`fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-white p-6 flex flex-col z-40 transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-2 mb-12 cursor-pointer" onClick={() => navigate('/student/dashboard')}>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/20">E</div>
          <h1 className="text-xl font-black tracking-tighter uppercase">ExamFlow</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { Icon: LayoutDashboard, label: 'Dashboard', active: true, path: '/student/dashboard' },
            { Icon: ClipboardList, label: 'My Results', active: false , path: '/student/results'},
            { Icon: Activity, label: 'Analytics', active: false, path: '/student/analytics' },
            { Icon: Settings, label: 'Preferences', active: false , path: '/student/settings'},
          ].map((item) => (
            <button 
              key={item.label} 
              type="button"
              onClick={() => { navigate(item.path); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-200 ${item.active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <item.Icon size={18} /> <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button 
          onClick={handleLogout} 
          type="button"
          className="flex items-center gap-3 px-4 py-4 rounded-2xl font-bold text-sm text-red-400 hover:bg-red-500/10 transition-all mt-auto border border-transparent hover:border-red-500/20"
        >
          <LogOut size={18} /> <span>LogOut</span>
        </button>
      </aside>

      {/* Main Workspace */}
      <main className="lg:pl-72 p-4 md:p-8 lg:pr-8">
        <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-10 gap-4">
          <div>
            <h2 className={`text-4xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Student Portal</h2>
            <p className="text-slate-500 font-medium">Greetings, <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{user?.name}</span></p>
          </div>
          <button 
            type="button"
            onClick={() => setShowJoinModal(true)}
            className={`bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] font-bold flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl active:scale-95 ${
              theme === 'dark' ? 'shadow-indigo-500/20' : 'shadow-indigo-200'
            }`}
          >
            <KeyRound size={20} /> <span>Join Exam Session</span>
          </button>
        </header>

        {/* Stats Section - Student Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className={`p-8 rounded-[2.5rem] border shadow-sm group hover:shadow-md transition-shadow ${
            theme === 'dark' ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform ${
              theme === 'dark' ? 'bg-indigo-500/20' : 'bg-indigo-100'
            }`}>
              <Activity size={20} />
            </div>
            <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-1">Active Now</p>
            <p className={`text-4xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{stats.active.toString().padStart(2, '0')}</p>
          </div>
          <div className={`p-8 rounded-[2.5rem] border shadow-sm group hover:shadow-md transition-shadow ${
            theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-gradient-to-br from-emerald-50 to-white border-emerald-100'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform ${
              theme === 'dark' ? 'bg-emerald-500/20' : 'bg-emerald-100'
            }`}>
              <CheckCircle2 size={20} />
            </div>
            <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-1">Completed</p>
            <p className={`text-4xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{stats.completed.toString().padStart(2, '0')}</p>
          </div>
          <div className={`p-8 rounded-[2.5rem] border shadow-sm group hover:shadow-md transition-shadow ${
            theme === 'dark' ? 'bg-purple-500/10 border-purple-500/20' : 'bg-gradient-to-br from-purple-50 to-white border-purple-100'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform ${
              theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'
            }`}>
              <ClipboardList size={20} />
            </div>
            <p className="text-purple-400 text-[10px] font-black uppercase tracking-widest mb-1">Avg. Grade</p>
            <p className="text-4xl font-black text-purple-600">{stats.avgGrade}%</p>
          </div>
        </div>

        {/* Attempt History Container */}
        <div className={`rounded-[3rem] border shadow-sm overflow-hidden ${
          theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className={`p-8 border-b flex justify-between items-center ${
            theme === 'dark' ? 'border-slate-800 bg-slate-800/30' : 'border-slate-100 bg-slate-50/50'
          }`}>
            <h3 className={`font-black text-xl tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Recent Activity</h3>
            <button 
              type="button" 
              onClick={() => navigate('/student/results')}
              className="text-indigo-600 font-bold text-sm hover:underline flex items-center gap-1"
            >
              View Full History <ChevronRight size={16}/>
            </button>
          </div>
          <div className={`divide-y ${theme === 'dark' ? 'divide-slate-800' : 'divide-slate-100'}`}>
            {attempts.length > 0 ? attempts.slice(0, 3).map((item) => {
              const isPublished = item.results_published;
              const showScore = isPublished && item.score !== null && item.score !== undefined;
              
              return (
              <div key={item.attempt_id} className={`p-6 flex items-center justify-between transition-all cursor-default group ${
                theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/80'
              }`}>
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black transition-all ${
                    showScore ? 'bg-emerald-50 text-emerald-600' : (theme === 'dark' ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-300')
                  }`}>
                    <span className="text-[8px] tracking-widest mb-0.5 uppercase">Grade</span>
                    <span className="text-xl leading-none">{showScore ? item.score : '—'}</span>
                  </div>
                  <div>
                    <h4 className={`font-bold text-lg group-hover:text-indigo-600 transition-colors tracking-tight ${
                      theme === 'dark' ? 'text-white' : 'text-slate-800'
                    }`}>{item.exam_title}</h4>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                      Attempt ID: #{item.attempt_id} | {new Date(item.start_time).toLocaleDateString()} | Status: <span className={item.status === 'ONGOING' ? 'text-indigo-600' : 'text-slate-500'}>{item.status}</span>
                      {showScore ? ` | Score: ${item.score}/${item.total_marks}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   {item.status !== 'ONGOING' && isPublished ? (
                     <button 
                       type="button"
                       onClick={() => navigate(`/student/result/${item.attempt_id}`)}
                       className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-indigo-600 transition-all shadow-md active:scale-95 flex items-center gap-2"
                     >
                       <FileText size={14} /> Review Details
                     </button>
                   ) : null}
                   {item.status !== 'ONGOING' && !isPublished ? (
                     <span className="px-4 py-2 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs flex items-center gap-2">
                       <Clock size={14} /> Results Pending
                     </span>
                   ) : null}
                </div>
              </div>
              );
            }) : (
              <div className="p-20 text-center text-slate-300 font-bold">
                No activity found.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Join Session Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`rounded-[3.5rem] p-12 w-full max-w-xl shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-8 duration-500 ${
            theme === 'dark' ? 'bg-[#161b2b]' : 'bg-white'
          }`}>
             <div className="absolute top-0 left-0 w-full h-3 bg-indigo-600" />
             
             <div className="flex justify-between items-start mb-10">
               <div>
                 <h3 className={`text-3xl font-black mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Enter Exam Room</h3>
                 <p className="text-slate-500 font-medium">Verify your access credentials to initialize a session.</p>
               </div>
               <button 
                type="button"
                onClick={() => setShowJoinModal(false)}
                className={`p-3 rounded-full transition-colors ${
                  theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'
                }`}
               >
                 <XIcon className="text-slate-400" size={20} />
               </button>
             </div>

             <form onSubmit={handleJoinSession} className="space-y-6">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block tracking-widest">Exam ID</label>
                   <input 
                    type="number" required 
                    className={`w-full p-5 border rounded-[1.5rem] outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium ${
                      theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                    }`} 
                    placeholder="e.g. 1" 
                    value={joinForm.exam_id} 
                    onChange={e => setJoinForm({...joinForm, exam_id: e.target.value})} 
                   />
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block tracking-widest">Exam Code</label>
                   <input 
                    type="text" required 
                    className={`w-full p-5 border rounded-[1.5rem] outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium ${
                      theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                    }`} 
                    placeholder="Enter exam code" 
                    value={joinForm.exam_code} 
                    onChange={e => setJoinForm({...joinForm, exam_code: e.target.value})} 
                   />
                </div>
                
                <div className="flex gap-4 mt-8">
                   <button type="button" onClick={() => setShowJoinModal(false)} className={`flex-1 py-5 rounded-[2rem] font-bold transition ${
                     theme === 'dark' ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                   }`}>Go Back</button>
                   <button 
                    disabled={isLoading}
                    type="submit"
                    className="flex-1 py-5 bg-slate-900 text-white rounded-[2rem] font-bold hover:bg-indigo-600 transition shadow-xl flex items-center justify-center gap-3"
                   >
                     {isLoading ? <Loader2 className="animate-spin" size={20} /> : <ChevronRight size={20} strokeWidth={3} />}
                     <span>{isLoading ? "Verifying..." : "Initialize Session"}</span>
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};


export default StudentDashContent;