import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../App';
import { getTeacherAnalytics } from '../../api/teacherApi';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import TeacherSidebar from '../../components/TeacherSidebar';
import {
  LayoutDashboard,
  ClipboardList,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  TrendingUp,
  Users,
  Award,
  AlertCircle,
  Loader2
} from 'lucide-react';

const Analytics = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme } = useTheme();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await getTeacherAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0b0f1a]' : 'bg-slate-50'}`}>
      <TeacherSidebar />

      <div className="lg:pl-64 pt-20 md:pt-20 lg:pt-0 p-6 md:p-8 lg:pl-72 lg:pr-8">
        <header className="mb-10">
          <h2 className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Analytics Dashboard</h2>
          <p className="text-slate-500 font-medium">Insights into student performance and exam effectiveness</p>
        </header>

        {loading ? (
          <div className={`rounded-[3rem] border shadow-sm p-20 text-center ${
            theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <Loader2 className="animate-spin mx-auto text-indigo-600 mb-4" size={40} />
            <p className="text-slate-400 font-medium">Loading analytics...</p>
          </div>
        ) : !analytics ? (
          <div className={`rounded-[3rem] border shadow-sm p-20 text-center ${
            theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <BarChart3 className="mx-auto text-slate-200 mb-4" size={48} />
            <h3 className={`font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>No Data Available</h3>
            <p className="text-slate-400 text-sm">Create exams and get submissions to see analytics.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className={`p-6 rounded-[2rem] border shadow-sm ${
                theme === 'dark' ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                    <TrendingUp size={20} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Score</p>
                </div>
                <p className="text-3xl font-black text-indigo-600">{analytics.avgScore}%</p>
              </div>
              <div className={`p-6 rounded-[2rem] border shadow-sm ${
                theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-gradient-to-br from-emerald-50 to-white border-emerald-100'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                    <Award size={20} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pass Rate</p>
                </div>
                <p className="text-3xl font-black text-emerald-600">{analytics.passRate}%</p>
              </div>
              <div className={`p-6 rounded-[2rem] border shadow-sm ${
                theme === 'dark' ? 'bg-blue-500/10 border-blue-500/20' : 'bg-gradient-to-br from-blue-50 to-white border-blue-100'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                    <Users size={20} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Students</p>
                </div>
                <p className="text-3xl font-black text-blue-600">{analytics.totalStudents}</p>
              </div>
              <div className={`p-6 rounded-[2rem] border shadow-sm ${
                theme === 'dark' ? 'bg-rose-500/10 border-rose-500/20' : 'bg-gradient-to-br from-rose-50 to-white border-rose-100'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600">
                    <AlertCircle size={20} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Need Help</p>
                </div>
                <p className="text-3xl font-black text-rose-600">{analytics.needHelp}</p>
              </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className={`p-8 rounded-[2.5rem] border shadow-sm ${
                theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <h3 className={`font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Performance Trend (Last 30 Days)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={analytics.performanceTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} />
                    <Line type="monotone" dataKey="avgScore" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className={`p-8 rounded-[2.5rem] border shadow-sm ${
                theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <h3 className={`font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Score Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics.scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="range" stroke="#64748b" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} />
                    <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className={`p-8 rounded-[2.5rem] border shadow-sm ${
                theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <h3 className={`font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Course Performance</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics.coursePerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="course_name" stroke="#64748b" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} />
                    <Bar dataKey="avgScore" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className={`p-8 rounded-[2.5rem] border shadow-sm ${
                theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <h3 className={`font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Pass/Fail Ratio</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={analytics.passFailRatio}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.passFailRatio.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top/Bottom Performers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className={`p-8 rounded-[2.5rem] border shadow-sm ${
                theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <h3 className={`font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Top Performers</h3>
                <div className="space-y-4">
                  {analytics.topPerformers.map((student, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {idx + 1}
                        </div>
                        <span className={`font-bold ${theme === 'dark' ? 'text-slate-800' : 'text-slate-800'}`}>{student.name}</span>
                      </div>
                      <span className="font-black text-emerald-600">{student.avgScore}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-8 rounded-[2.5rem] border shadow-sm ${
                theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <h3 className={`font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Students Needing Help</h3>
                <div className="space-y-4">
                  {analytics.needHelpStudents.map((student, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-rose-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-rose-600 text-white rounded-full flex items-center justify-center">
                          <AlertCircle size={16} />
                        </div>
                        <span className={`font-bold ${theme === 'dark' ? 'text-slate-800' : 'text-slate-800'}`}>{student.name}</span>
                      </div>
                      <span className="font-black text-rose-600">{student.avgScore}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
