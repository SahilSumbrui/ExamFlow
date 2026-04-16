import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
  LayoutDashboard, ClipboardList, Settings, LogOut, ArrowLeft,
  Activity, Award, Zap, Menu, X, TrendingUp, TrendingDown,
  Book, Timer, Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../App';
import { getStudentAnalytics } from '../../api/studentApi';

const COURSE_COLORS = [
  'bg-blue-500', 'bg-indigo-500', 'bg-emerald-500',
  'bg-purple-500', 'bg-rose-500', 'bg-amber-500'
];

const StudentAnalysisContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { logout } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeCourse, setActiveCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sidebarItems = [
    { Icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
    { Icon: ClipboardList, label: 'My Results', path: '/student/results' },
    { Icon: Activity, label: 'Analytics', path: '/student/analytics' },
    { Icon: Settings, label: 'Preferences', path: '/student/settings' },
  ];

  useEffect(() => {
    getStudentAnalytics()
      .then(res => setAnalytics(res.data))
      .catch(() => setError('Failed to load analytics data.'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const filteredCourses = useMemo(() => {
    if (!analytics?.courses) return [];
    return analytics.courses.filter(c =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [analytics, searchTerm]);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0b0f1a] text-white' : 'bg-slate-50 text-slate-900'}`}>

      {/* Mobile Header */}
      <header className={`lg:hidden p-4 flex justify-between items-center sticky top-0 z-30 shadow-md ${theme === 'dark' ? 'bg-[#161b2b]' : 'bg-slate-900 text-white'}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-black text-sm text-white">E</div>
          <h1 className="text-sm font-black tracking-tighter uppercase text-white">ExamFlow</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-400">
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 bottom-0 w-64 p-6 flex flex-col z-40 transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${theme === 'dark' ? 'bg-[#161b2b] border-r border-slate-800' : 'bg-slate-900 text-white'}`}>
        <div className="flex items-center gap-2 mb-12 cursor-pointer" onClick={() => navigate('/student/dashboard')}>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/20 text-white">E</div>
          <h1 className="text-xl font-black tracking-tighter uppercase text-white">ExamFlow</h1>
        </div>
        <nav className="flex-1 space-y-2">
          {sidebarItems.map((item) => (
            <button key={item.label} onClick={() => { navigate(item.path); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-200 ${location.pathname === item.path ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <item.Icon size={18} /> <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-4 rounded-2xl font-bold text-sm text-red-400 hover:bg-red-500/10 transition-all mt-auto border border-transparent hover:border-red-500/20">
          <LogOut size={18} /> <span>Sign Out</span>
        </button>
      </aside>

      {/* Main */}
      <main className="lg:pl-72 p-4 md:p-8 lg:p-12 space-y-10">

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="animate-spin text-indigo-500" size={40} />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-rose-500 font-bold">{error}</p>
          </div>
        ) : !activeCourse ? (
          /* STAGE 1: OVERALL DASHBOARD */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl">
            <header className="mb-10">
              <h2 className="text-4xl font-black tracking-tight">Performance Overview</h2>
              <p className="text-slate-500 font-medium">Global academic metrics and course progression.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className={`p-10 rounded-[3rem] border shadow-sm flex items-center gap-8 ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500"><Award size={32} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tests Completed</p>
                  <p className="text-4xl font-black">{analytics.totalCompleted}</p>
                </div>
              </div>
              <div className={`p-10 rounded-[3rem] border shadow-sm flex items-center gap-8 ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500"><Zap size={32} /></div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Strength Subject</p>
                  <p className="text-xl font-black truncate">{analytics.coreStrength}</p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl border mb-8 ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'}`}>
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-transparent outline-none flex-1 font-medium text-sm placeholder:text-slate-400"
              />
            </div>

            {filteredCourses.length === 0 ? (
              <div className="text-center py-20 text-slate-400 font-bold">
                {analytics.courses.length === 0 ? 'No completed exams yet.' : 'No courses match your search.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredCourses.map((course, i) => (
                  <button key={course.id} onClick={() => setActiveCourse(course)}
                    className={`p-8 rounded-[3rem] border text-left group transition-all hover:translate-y-[-4px] hover:shadow-2xl ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800 hover:border-indigo-500' : 'bg-white border-slate-100 hover:border-indigo-200 shadow-sm'}`}>
                    <div className={`w-14 h-14 rounded-2xl ${COURSE_COLORS[i % COURSE_COLORS.length]} flex items-center justify-center text-white mb-8 shadow-lg group-hover:scale-110 transition-transform`}><Book size={28} /></div>
                    <h3 className="text-xl font-black mb-1 group-hover:text-indigo-600 transition-colors truncate w-full">{course.title}</h3>
                    <div className="flex items-center justify-between pt-8 border-t border-slate-50 dark:border-slate-800">
                      <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tests</p><p className="text-lg font-black">{course.examCount}</p></div>
                      <div className="text-right"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Score</p><p className="text-lg font-black text-indigo-600">{course.avg}%</p></div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* STAGE 2: COURSE SPECIFIC ANALYSIS */
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-6xl space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <button onClick={() => setActiveCourse(null)}
                  className={`p-3.5 rounded-2xl border shadow-sm transition-all active:scale-95 ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-900'}`}>
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h2 className="text-3xl font-black tracking-tight">{activeCourse.title}</h2>
                  <p className="text-slate-500 font-medium text-sm">Course Progression Insights</p>
                </div>
              </div>
              <div className={`flex items-center gap-4 px-6 py-3.5 rounded-[1.5rem] border ${activeCourse.trend === 'positive' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                {activeCourse.trend === 'positive' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                <span className="font-black text-sm uppercase tracking-widest">{activeCourse.velocity} Velocity</span>
              </div>
            </header>

            {/* Benchmark */}
            <div className={`p-10 rounded-[3rem] border flex flex-col justify-center text-center ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Vs Peer Average ({activeCourse.classAvg}%)</p>
              <p className={`text-6xl font-black ${activeCourse.avg >= activeCourse.classAvg ? 'text-emerald-500' : 'text-rose-500'}`}>
                {activeCourse.avg >= activeCourse.classAvg ? '+' : ''}{activeCourse.avg - activeCourse.classAvg}%
              </p>
              <p className="text-xs font-bold text-slate-500 mt-3">Relative Class Performance</p>
            </div>

            {/* Chart */}
            <div className={`p-8 md:p-10 rounded-[3.5rem] border ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'}`}>
              <h3 className="text-xl font-black mb-10">Test Momentum</h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activeCourse.tests}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1e293b' : '#f1f5f9'} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} dy={10} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} dx={-10} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }} />
                    <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={5} fillOpacity={1} fill="url(#colorScore)" animationDuration={1500} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Test History */}
            <div className={`rounded-[3rem] border overflow-hidden ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-black">Detailed Assessment Log</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="p-8">Test Name</th>
                      <th className="p-8">Percentage</th>
                      <th className="p-8">Duration Taken</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {activeCourse.tests.map((test, i) => (
                      <tr key={i} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-8 font-bold">{test.name}</td>
                        <td className="p-8">
                          <div className="flex items-center gap-3">
                            <span className={`w-2 h-2 rounded-full ${test.score >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <span className="font-black text-lg">{test.score}%</span>
                          </div>
                        </td>
                        <td className="p-8 text-slate-500 font-medium flex items-center gap-2"><Timer size={14} /> {test.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentAnalysisContent;
