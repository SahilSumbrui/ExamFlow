import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../App";
import { getAllUsers, deleteUser, getAllExamsWithDetails, deleteExam, getAllAttempts, getSystemStats, getAttemptsOverTime, getScoreDistribution } from "../../api/adminApi";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  ShieldAlert, 
  Users, 
  Globe, 
  Activity, 
  Trash2, 
  BarChart3,
  FileText,
  LogOut,
  CheckCircle,
  Menu,
  X,
  Settings
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [allUsers, setAllUsers] = useState([]);
  const [allExams, setAllExams] = useState([]);
  const [allAttempts, setAllAttempts] = useState([]);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState({ attempts: [], scores: [] });
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchSystemStats();
    } else if (activeTab === 'users') {
      fetchAllUsers();
    } else if (activeTab === 'exams') {
      fetchAllExams();
    } else if (activeTab === 'attempts') {
      fetchAllAttempts();
    }
  }, [activeTab]);

  const fetchSystemStats = async () => {
    setLoading(true);
    try {
      const [statsRes, attemptsRes, scoresRes] = await Promise.all([
        getSystemStats(),
        getAttemptsOverTime(),
        getScoreDistribution()
      ]);
      setStats(statsRes.data);
      setChartData({ attempts: attemptsRes.data, scores: scoresRes.data });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      setAllUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllExams = async () => {
    setLoading(true);
    try {
      const response = await getAllExamsWithDetails();
      setAllExams(response.data);
    } catch (error) {
      console.error("Error fetching exams:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAttempts = async () => {
    setLoading(true);
    try {
      const response = await getAllAttempts();
      setAllAttempts(response.data);
    } catch (error) {
      console.error("Error fetching attempts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user_id) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await deleteUser(user_id);
      fetchAllUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleDeleteExam = async (exam_id) => {
    if (!window.confirm("Are you sure you want to delete this exam? This action cannot be undone.")) return;
    try {
      await deleteExam(exam_id);
      fetchAllExams();
    } catch (error) {
      console.error("Error deleting exam:", error);
    }
  };

  const handleLogout = (e) => {
    if (e) e.preventDefault();
    logout();
    navigate("/", { replace: true });
  };

  const statsData = stats ? [
    { label: 'Total Users', value: stats.totalUsers, sub: `${stats.totalStudents} Students | ${stats.totalTeachers} Teachers`, icon: Users, color: 'text-blue-600' },
    { label: 'Exams Created', value: stats.totalExams, sub: 'Lifetime total', icon: FileText, color: 'text-indigo-600' },
    { label: 'Active Now', value: stats.activeExams, sub: 'Exams currently live', icon: Globe, color: 'text-emerald-600' },
    { label: 'Avg. Score', value: stats.avgScore ? `${Math.round(stats.avgScore)}%` : 'N/A', sub: `${stats.totalAttempts} total attempts`, icon: BarChart3, color: 'text-rose-600' },
  ] : [];

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0b0f1a] text-white' : 'bg-[#F8FAFC] text-slate-900'}`}>
      {/* Mobile Header */}
      <header className="lg:hidden bg-slate-900 text-white p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-30 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center font-black text-sm">A</div>
          <h1 className="text-sm font-black tracking-tighter uppercase">Control Room</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-400">
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`w-72 bg-slate-950 text-white fixed h-full flex flex-col p-6 z-20 transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:flex`}>
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center font-black shadow-lg">A</div>
          <span className="font-black text-xl tracking-tighter uppercase">Control Room</span>
        </div>

        <nav className="space-y-1 flex-1">
          <NavItem active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }} icon={Activity} label="System Overview" />
          <NavItem active={activeTab === 'users'} onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }} icon={Users} label="User Management" />
          <NavItem active={activeTab === 'exams'} onClick={() => { setActiveTab('exams'); setIsSidebarOpen(false); }} icon={ShieldAlert} label="Exam Oversight" />
          <NavItem active={activeTab === 'attempts'} onClick={() => { setActiveTab('attempts'); setIsSidebarOpen(false); }} icon={CheckCircle} label="Attempt Monitoring" />
          <NavItem active={false} onClick={() => { navigate('/admin/settings'); setIsSidebarOpen(false); }} icon={Settings} label="Preferences" />
        </nav>

        <div className="mt-auto space-y-4">
          <button
            onClick={handleLogout}
            type="button"
            className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>

          <div className="p-4 bg-slate-900 rounded-2xl border border-white/5">
            <p className="text-[10px] font-black text-slate-500 uppercase mb-2">System Status</p>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              All Nodes Operational
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 p-4 pt-20 lg:p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {activeTab === 'overview' && "Platform Analytics"}
              {activeTab === 'users' && "User Directory"}
              {activeTab === 'exams' && "Global Exam Monitor"}
              {activeTab === 'attempts' && "Attempt Logs"}
            </h1>
            <p className="text-slate-500 font-medium">Root Administration Interface</p>
          </div>
        </header>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {loading ? (
              <div className={`rounded-[2.5rem] border shadow-sm p-20 text-center ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-400 font-medium">Loading stats...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {statsData.map((s, i) => (
                    <div key={i} className={`p-6 rounded-3xl border shadow-sm ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'}`}>
                      <s.icon className={`${s.color} mb-4`} size={24} />
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{s.label}</p>
                      <h3 className={`text-3xl font-black mt-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{s.value}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-1">{s.sub}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className={`p-8 rounded-[2.5rem] border shadow-sm ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'}`}>
                    <h3 className={`font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Attempts Over Time (Last 30 Days)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={chartData.attempts}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} />
                        <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className={`p-8 rounded-[2.5rem] border shadow-sm ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'}`}>
                    <h3 className={`font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Score Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={chartData.scores}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="score_range" stroke="#64748b" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} />
                        <Bar dataKey="count" fill="#f43f5e" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* User Management */}
        {activeTab === 'users' && (
          <div className={`rounded-[2.5rem] border shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'}`}>
            {loading ? (
              <div className="p-20 text-center">
                <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-400 font-medium">Loading users...</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className={`text-slate-400 text-[10px] font-black tracking-widest uppercase ${theme === 'dark' ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                    <th className="px-8 py-5">User</th>
                    <th className="px-8 py-5">Role</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5">Joined</th>
                    <th className="px-8 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className={`${theme === 'dark' ? 'divide-y divide-slate-800' : 'divide-y divide-slate-100'}`}>
                  {allUsers.map((user) => (
                    <UserRow
                      key={user.user_id}
                      user_id={user.user_id}
                      name={user.name}
                      email={user.email}
                      role={user.role}
                      date={new Date(user.created_at).toLocaleDateString()}
                      onDelete={handleDeleteUser}
                      theme={theme}
                      navigate={navigate}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Exam Monitoring */}
        {activeTab === 'exams' && (
          <div className="space-y-4 animate-in fade-in">
            {loading ? (
              <div className={`rounded-[2.5rem] border shadow-sm p-20 text-center ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-400 font-medium">Loading exams...</p>
              </div>
            ) : allExams.length === 0 ? (
              <div className={`rounded-[2.5rem] border shadow-sm p-20 text-center ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'}`}>
                <FileText className="mx-auto text-slate-200 mb-4" size={48} />
                <h3 className={`font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>No Exams Found</h3>
                <p className="text-slate-400 text-sm">No exams have been created yet.</p>
              </div>
            ) : (
              <>
                {allExams.map((exam) => {
                  const now = new Date();
                  const isLive = now >= new Date(exam.start_time) && now <= new Date(exam.end_time);
                  return (
                    <ExamMonitorRow
                      key={exam.exam_id}
                      exam_id={exam.exam_id}
                      title={exam.title}
                      teacher={exam.teacher_name}
                      attempts={exam.attempt_count}
                      status={isLive ? 'Live' : 'Idle'}
                      onDelete={handleDeleteExam}
                      theme={theme}
                      navigate={navigate}
                    />
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* Attempt Monitoring */}
        {activeTab === 'attempts' && (
          <div className={`rounded-[2.5rem] border shadow-sm p-8 animate-in fade-in ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'}`}>
            {loading ? (
              <div className="p-20 text-center">
                <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-400 font-medium">Loading attempts...</p>
              </div>
            ) : allAttempts.length === 0 ? (
              <div className="p-20 text-center">
                <Activity className="mx-auto text-slate-200 mb-4" size={48} />
                <h3 className={`font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>No Attempts Found</h3>
                <p className="text-slate-400 text-sm">No exam attempts have been recorded yet.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-8">
                  <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Recent Exam Attempts</h3>
                  <span className="px-4 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-black uppercase">{allAttempts.length} Total</span>
                </div>
                <div className="space-y-4">
                  {allAttempts.map((attempt) => (
                    <AttemptRow
                      key={attempt.attempt_id}
                      user={attempt.student_name}
                      exam={attempt.exam_title}
                      score={attempt.score ? `${attempt.score}/${attempt.total_marks || 100}` : 'Pending'}
                      status={attempt.status}
                      theme={theme}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm transition-all ${active ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
  >
    <Icon size={20} />
    {label}
  </button>
);

const UserRow = ({ user_id, name, email, role, date, onDelete, theme, navigate }) => {
  const handleRowClick = () => {
    if (role === 'STUDENT') {
      navigate(`/admin/student/${user_id}`);
    } else if (role === 'TEACHER') {
      navigate(`/admin/teacher/${user_id}`);
    }
  };

  return (
    <tr className={`group transition-colors ${(role === 'STUDENT' || role === 'TEACHER') ? 'cursor-pointer' : ''} ${theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
      <td className="px-8 py-5" onClick={handleRowClick}>
        <div className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{name}</div>
        <div className="text-xs text-slate-400">{email}</div>
      </td>
      <td className="px-8 py-5" onClick={handleRowClick}>
        <span className={`text-[10px] font-black px-3 py-1 rounded-full ${role === 'TEACHER' ? 'bg-indigo-50 text-indigo-600' : role === 'ADMIN' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>{role}</span>
      </td>
      <td className="px-8 py-5" onClick={handleRowClick}>
        <div className="flex items-center gap-2 font-bold text-sm text-emerald-500">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Active
        </div>
      </td>
      <td className="px-8 py-5 text-sm font-medium text-slate-500" onClick={handleRowClick}>{date}</td>
      <td className="px-8 py-5 text-right">
        <button onClick={() => onDelete(user_id)} title="Delete User" className="p-2 text-slate-300 hover:text-red-600 transition-colors">
          <Trash2 size={18} />
        </button>
      </td>
    </tr>
  );
};

const ExamMonitorRow = ({ exam_id, title, teacher, attempts, status, onDelete, theme, navigate }) => (
  <div onClick={() => navigate(`/admin/exam/${exam_id}`)} className={`p-6 rounded-[2rem] border shadow-sm flex items-center justify-between group transition-all cursor-pointer ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800 hover:border-rose-500' : 'bg-white border-slate-200 hover:border-rose-200'}`}>
    <div className="flex items-center gap-6">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${status === 'Live' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
        <Activity size={20} className={status === 'Live' ? 'animate-pulse' : ''} />
      </div>
      <div>
        <h4 className={`font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{title}</h4>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Instructor: {teacher} | {attempts} Attempts</p>
      </div>
    </div>
    <button onClick={(e) => { e.stopPropagation(); onDelete(exam_id); }} className="p-2 text-slate-300 hover:text-red-600 transition-colors" title="Delete Exam">
      <Trash2 size={20} />
    </button>
  </div>
);

const AttemptRow = ({ user, exam, score, status, theme }) => (
  <div className={`flex items-center justify-between p-4 border rounded-2xl transition-all ${theme === 'dark' ? 'border-slate-800 hover:bg-slate-800/50' : 'border-slate-100 hover:bg-slate-50'}`}>
    <div className="flex items-center gap-4">
      <div className="w-2 h-10 bg-slate-200 rounded-full" />
      <div>
        <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{user || 'Unknown User'}</span>
        <p className="text-xs text-slate-500 font-medium">Attempting: {exam || 'Unknown Exam'}</p>
      </div>
    </div>
    <div className="text-right">
      <div className={`font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{score}</div>
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{status}</div>
    </div>
  </div>
);

export default AdminDashboard;
