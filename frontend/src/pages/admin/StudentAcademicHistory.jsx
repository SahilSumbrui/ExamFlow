import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../App';
import { ArrowLeft, Award, TrendingUp, TrendingDown, Book, Timer, Loader2 } from 'lucide-react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const StudentAcademicHistory = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const { theme } = useTheme();
  const [student, setStudent] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [activeCourse, setActiveCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const [studentRes, analyticsRes] = await Promise.all([
          fetch(`/api/auth/users/${studentId}`, { headers }).then(r => r.json()),
          fetch(`/api/admin/student-analytics/${studentId}`, { headers }).then(r => r.json())
        ]);
        setStudent(studentRes);
        setAnalytics(analyticsRes);
      } catch (err) {
        setError('Failed to load student data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, [studentId]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#0b0f1a]' : 'bg-slate-50'}`}>
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#0b0f1a]' : 'bg-slate-50'}`}>
        <div className="text-center">
          <p className="text-rose-500 font-bold mb-4">{error}</p>
          <button onClick={() => navigate('/admin/dashboard')} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0b0f1a] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <main className="p-4 md:p-8 lg:p-12 space-y-10">
        
        {/* Header */}
        <header className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/dashboard')} 
            className={`p-3 border rounded-2xl transition-all shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-900'}`}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {student?.name}'s Academic History
            </h2>
            <p className="text-slate-500 font-medium text-sm">{student?.email}</p>
          </div>
        </header>

        {!activeCourse ? (
          /* STAGE 1: OVERALL DASHBOARD */
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-8 rounded-[2.5rem] border shadow-sm ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                    <Award size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tests Completed</p>
                    <p className="text-3xl font-black">{analytics?.totalCompleted || 0}</p>
                  </div>
                </div>
              </div>
              <div className={`p-8 rounded-[2.5rem] border shadow-sm ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Average Score</p>
                    <p className="text-3xl font-black">{analytics?.avgScore ? `${Math.round(analytics.avgScore)}%` : 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className={`p-8 rounded-[2.5rem] border shadow-sm ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                    <Book size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strength Subject</p>
                    <p className="text-lg font-black truncate">{analytics?.coreStrength || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Courses */}
            {analytics?.courses && analytics.courses.length > 0 ? (
              <div>
                <h3 className="text-2xl font-black mb-6">Course Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {analytics.courses.map((course, i) => (
                    <button 
                      key={course.id} 
                      onClick={() => setActiveCourse(course)}
                      className={`p-8 rounded-[2.5rem] border text-left group transition-all hover:translate-y-[-4px] ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800 hover:border-indigo-500' : 'bg-white border-slate-100 hover:border-indigo-200 shadow-sm'}`}
                    >
                      <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 mb-4 group-hover:scale-110 transition-transform">
                        <Book size={24} />
                      </div>
                      <h4 className="text-lg font-black mb-1 group-hover:text-indigo-600 transition-colors truncate">{course.title}</h4>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tests</p>
                          <p className="text-lg font-black">{course.examCount}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Score</p>
                          <p className="text-lg font-black text-indigo-600">{course.avg}%</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`p-12 rounded-[2.5rem] border text-center ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-100'}`}>
                <p className="text-slate-400 font-bold">No exam attempts yet</p>
              </div>
            )}
          </div>
        ) : (
          /* STAGE 2: COURSE SPECIFIC ANALYSIS */
          <div className="space-y-8">
            <header className="flex items-center gap-4">
              <button 
                onClick={() => setActiveCourse(null)}
                className={`p-3 border rounded-2xl transition-all ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-900'}`}
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h3 className="text-2xl font-black">{activeCourse.title}</h3>
                <p className="text-slate-500 font-medium text-sm">Course Performance Details</p>
              </div>
            </header>

            {/* Benchmark */}
            <div className={`p-10 rounded-[2.5rem] border text-center ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Vs Peer Average ({activeCourse.classAvg}%)</p>
              <p className={`text-5xl font-black ${activeCourse.avg >= activeCourse.classAvg ? 'text-emerald-500' : 'text-rose-500'}`}>
                {activeCourse.avg >= activeCourse.classAvg ? '+' : ''}{activeCourse.avg - activeCourse.classAvg}%
              </p>
              <p className="text-xs font-bold text-slate-500 mt-3">Relative Class Performance</p>
            </div>

            {/* Chart */}
            {activeCourse.tests && activeCourse.tests.length > 0 && (
              <div className={`p-8 md:p-10 rounded-[2.5rem] border ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'}`}>
                <h4 className="text-lg font-black mb-8">Test Performance Trend</h4>
                <div className="h-[300px]">
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
                      <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Test History */}
            {activeCourse.tests && activeCourse.tests.length > 0 && (
              <div className={`rounded-[2.5rem] border overflow-hidden ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-lg font-black">Test History</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="p-6">Test Name</th>
                        <th className="p-6">Score</th>
                        <th className="p-6">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {activeCourse.tests.map((test, i) => (
                        <tr key={i} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="p-6 font-bold">{test.name}</td>
                          <td className="p-6">
                            <div className="flex items-center gap-3">
                              <span className={`w-2 h-2 rounded-full ${test.score >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                              <span className="font-black text-lg">{test.score}%</span>
                            </div>
                          </td>
                          <td className="p-6 text-slate-500 font-medium flex items-center gap-2">
                            <Timer size={14} /> {test.time}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentAcademicHistory;
