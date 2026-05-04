import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../App';
import { 
  LayoutDashboard, 
  ClipboardList, 
  BookOpen, 
  Settings, 
  LogOut, 
  Search,
  Filter,
  ChevronRight,
  Trophy,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Menu,
  X,
  User,
  Clock,
  Activity
} from 'lucide-react';

/**
 * MOCK DATA
 * In production: fetch(`/api/student/attempts`)
 */
const getMockResults = () => [
  { id: 'att-101', examTitle: 'Data Structures Mid-Term', courseId: 'CS-302', score: 26, total: 30, date: 'Oct 12, 2025', status: 'Passed' },
  { id: 'att-102', examTitle: 'System Design Fundamentals', courseId: 'CS-401', score: 28, total: 30, date: 'Oct 24, 2025', status: 'Passed' },
  { id: 'att-103', examTitle: 'Advanced Systems Programming', courseId: 'CS-402', score: 11, total: 30, date: 'Nov 02, 2025', status: 'Failed' },
  { id: 'att-104', examTitle: 'Introduction to AI', courseId: 'CS-101', score: 18, total: 30, date: 'Nov 05, 2025', status: 'Passed' },
];

import API from '../../api/axios';

const MyResultsContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [avgScore, setAvgScore] = useState(0);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await API.get(`/students/${user.user_id}/attempts`);
      const data = res.data;
      setResults(data);

      // Calculate average score as percentage (only for published results)
      const published = data.filter(a => a.results_published && (a.status === 'COMPLETED' || a.status === 'AUTO_SUBMITTED'));
      if (published.length > 0) {
        const avgPercentage = published.reduce((acc, a) => {
          const percentage = a.total_marks ? (a.score / a.total_marks * 100) : 0;
          return acc + percentage;
        }, 0) / published.length;
        setAvgScore(avgPercentage.toFixed(1));
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const sidebarItems = [
    { Icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
    { Icon: ClipboardList, label: 'My Results', path: '/student/results' },
    { Icon: Activity, label: 'Analytics', path: '/student/analytics' },
    { Icon: Settings, label: 'Preferences', path: '/student/settings' },
  ];

  const filteredResults = useMemo(() => {
    return results.filter(r => 
      r.exam_title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [results, searchTerm]);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  if (loading) return (
    <div className={`h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#0b0f1a]' : 'bg-slate-50'}`}>
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

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

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-white p-6 flex flex-col z-40 transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-2 mb-12">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/20">E</div>
          <h1 className="text-xl font-black tracking-tighter uppercase">ExamFlow</h1>
        </div>
        <nav className="flex-1 space-y-2">
          {sidebarItems.map((item) => (
            <button 
              key={item.label} 
              onClick={() => { navigate(item.path); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-200 ${location.pathname === item.path ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <item.Icon size={18} /> <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-4 rounded-2xl font-bold text-sm text-red-400 hover:bg-red-500/10 transition-all mt-auto">
          <LogOut size={18} /> <span>Sign Out</span>
        </button>
      </aside>

      {/* Main Workspace */}
      <main className="lg:pl-72 p-4 md:p-8 lg:p-12 lg:pr-8 space-y-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Academic History</h2>
            <p className="text-slate-500 font-medium text-sm">Review your past performances and detailed transcripts.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`px-5 py-3 rounded-2xl border flex items-center gap-3 ${
              theme === 'dark' ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'
            }`}>
              <Trophy className="text-indigo-600" size={20} />
              <div>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Average Score</p>
                <p className="text-lg font-black text-indigo-900">{avgScore}%</p>
              </div>
            </div>
          </div>
        </header>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by exam or course code..."
              className={`w-full pl-12 pr-4 py-4 border rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium ${
                theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200'
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Results Grid/List */}
        <div className={`rounded-[3rem] border shadow-sm overflow-hidden ${
          theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className={`divide-y ${theme === 'dark' ? 'divide-slate-800' : 'divide-slate-100'}`}>
            {filteredResults.map((result) => {
              const isPublished = result.results_published;
              const percentage = isPublished && result.score && result.total_marks ? Math.round((result.score / result.total_marks) * 100) : 0;
              const isPassed = percentage >= 40;
              
              return (
              <div 
                key={result.attempt_id} 
                onClick={() => isPublished ? navigate(`/student/result/${result.attempt_id}`) : null}
                className={`p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between transition-all ${isPublished ? 'cursor-pointer' : 'cursor-default'} group ${
                  theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-center gap-6 mb-4 md:mb-0">
                  <div className={`w-16 h-16 rounded-[1.5rem] flex flex-col items-center justify-center font-black transition-all ${
                    !isPublished ? 'bg-slate-100 text-slate-400' :
                    isPassed ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white' : 'bg-rose-50 text-rose-600 group-hover:bg-rose-500 group-hover:text-white'}`}>
                    <span className="text-[8px] tracking-widest mb-0.5 uppercase">Grade</span>
                    <span className="text-xl leading-none">{isPublished ? `${percentage}%` : '—'}</span>
                  </div>
                  <div>
                    <h4 className={`text-lg font-bold group-hover:text-indigo-600 transition-colors ${
                      theme === 'dark' ? 'text-white' : 'text-slate-800'
                    }`}>{result.exam_title}</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Attempt #{result.attempt_id}</span>
                      <div className="w-1 h-1 bg-slate-300 rounded-full" />
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5"><Calendar size={12}/> {new Date(result.start_time).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-none pt-4 md:pt-0">
                   <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Score Achieved</p>
                      <p className={`font-black ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{isPublished ? (result.score || '—') : '—'}</p>
                   </div>
                   <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                     !isPublished ? 'bg-slate-100 text-slate-500' :
                     isPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {!isPublished ? (
                        <>
                          <Clock size={12} />
                          Pending
                        </>
                      ) : (
                        <>
                          {isPassed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {isPassed ? 'Passed' : 'Failed'}
                        </>
                      )}
                   </div>
                   {isPublished ? (
                     <div className="p-2 text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all">
                        <ChevronRight size={24} />
                     </div>
                   ) : null}
                </div>
              </div>
              );
            })}
            
            {filteredResults.length === 0 && (
              <div className="p-20 text-center">
                <AlertCircle className="mx-auto text-slate-200 mb-4" size={48} />
                <p className="text-slate-400 font-bold">No examination records found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};


export default MyResultsContent;