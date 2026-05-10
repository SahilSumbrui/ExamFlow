import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../App';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  BarChart3, 
  LogOut, 
  Settings, 
  User, 
  Bell, 
  Monitor, 
  Mail, 
  BookOpen, 
  Menu, 
  X, 
  Sun,
  Moon,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

import API from '../../api/axios';

const TeacherPreferences = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Settings State
  const { theme, toggleTheme } = useTheme();
  const { user, logout, login } = useAuth();
  const [submissionAlerts, setSubmissionAlerts] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [userDetails, setUserDetails] = useState(user);

  // Modal States
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Form States
  const [profileData, setProfileData] = useState({ name: '' });
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const passwordRules = [
    { label: 'At least 8 characters', test: (p) => p.length >= 8 },
    { label: 'Uppercase letter', test: (p) => /[A-Z]/.test(p) },
    { label: 'Lowercase letter', test: (p) => /[a-z]/.test(p) },
    { label: 'Number', test: (p) => /[0-9]/.test(p) },
    { label: 'Special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
  ];

  useEffect(() => {
    if (user?.user_id) {
      API.get(`/auth/users/${user.user_id}`)
        .then(res => res.data)
        .then(data => {
            setUserDetails(data);
            setProfileData({ name: data.name || '' });
        })
        .catch(err => console.error('Error fetching user:', err));
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await API.put(`/auth/users/${user.user_id}`, profileData);
      if (response.status === 200) {
        const updated = response.data;
        setUserDetails(updated);
        // Update global auth context user state
        login(updated, localStorage.getItem('token'));
        setIsProfileModalOpen(false);
        alert("Profile updated successfully!");
      }
    } catch (err) { console.error('Update failed:', err); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await API.put('/auth/change-password', { newPassword: passwordData.newPassword });
      const data = response.data;

      if (response.status === 200) {
        alert("Password changed successfully! Please log in again.");
        localStorage.removeItem("token");
        setIsPasswordModalOpen(false);
        setPasswordData({ newPassword: "", confirmPassword: "" });
        // Proper logout flow
        logout();
        navigate('/');
      } else {
        alert(data.message || "Failed to change password");
      }

    } catch (err) {
      console.error("Password update failed:", err);
    }
  };

  const sidebarItems = [
    { Icon: LayoutDashboard, label: 'Dashboard', path: '/teacher/dashboard' },
    { Icon: ClipboardList, label: 'My Exams', path: '/teacher/exams' },
    { Icon: BookOpen, label: 'My Courses', path: '/teacher/courses' },
    { Icon: BarChart3, label: 'Analytics', path: '/teacher/analytics' },
    { Icon: Settings, label: 'Preferences', path: '/teacher/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0b0f1a] text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Sidebar & Mobile Header (Omitted for brevity, keep your original) */}
      <header className={`lg:hidden p-4 flex justify-between items-center sticky top-0 z-30 shadow-md ${theme === 'dark' ? 'bg-[#161b2b]' : 'bg-slate-900'}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-black text-sm text-white">E</div>
          <h1 className="text-sm font-black tracking-tighter uppercase text-white">ExamFlow</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-400"><Menu size={20} /></button>
      </header>

      <aside className={`fixed left-0 top-0 bottom-0 w-64 p-6 flex flex-col z-40 transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${theme === 'dark' ? 'bg-[#161b2b] border-r border-slate-800' : 'bg-slate-900 text-white'}`}>
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/20">E</div>
            <h1 className="text-xl font-black tracking-tighter uppercase">ExamFlow</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-white"><X size={20}/></button>
        </div>
        <nav className="flex-1 space-y-2">
          {sidebarItems.map((item) => (
            <button key={item.label} onClick={() => { navigate(item.path); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-200 ${location.pathname === item.path ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <item.Icon size={18} /> <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-4 rounded-2xl font-bold text-sm text-red-400 hover:bg-red-500/10 transition-all mt-auto"><LogOut size={18} /> <span>Logout</span></button>
      </aside>

      <main className="lg:pl-64 pt-20 md:pt-20 lg:pt-0 p-6 md:p-8 lg:pl-72 lg:pr-8 space-y-10">
        <header>
          <h2 className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Faculty Preferences</h2>
          <p className="text-slate-500 font-medium text-sm">Personalize your workspace and application behavior.</p>
        </header>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Profile Card */}
          <div className="lg:col-span-4">
            <div className={`rounded-[3rem] p-10 shadow-sm border text-center relative overflow-hidden ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="absolute top-0 left-0 w-full h-24 bg-indigo-600" />
                <div className="relative pt-12">
                  <div className={`w-24 h-24 rounded-[2.5rem] mx-auto p-1 shadow-xl mb-6 border flex items-center justify-center overflow-hidden ${theme === 'dark' ? 'bg-[#0b0f1a] border-slate-700' : 'bg-white border-slate-100'}`}>
                    <User size={48} className={theme === 'dark' ? 'text-slate-700' : 'text-slate-200'} />
                  </div>
                  <h3 className="text-2xl font-black mb-1">{userDetails?.name || 'Teacher'}</h3>
                  <p className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em] mb-8">ID: {userDetails?.user_id || 'N/A'}</p>
                  
                  <button 
                    onClick={() => setIsProfileModalOpen(true)}
                    className={`w-full mt-10 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 ${theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20' : 'bg-slate-900 hover:bg-indigo-600 text-white shadow-slate-200'}`}
                  >
                    Edit Profile
                  </button>
                </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-8">
             {/* Security Section (NEW) */}
             <div className={`rounded-[2.5rem] p-8 md:p-10 shadow-sm border ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'}`}>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                   <Lock size={14} className="text-indigo-500" /> Security & Access
                </h4>
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <div>
                         <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Account Password</p>
                         <p className="text-xs text-slate-500">Regularly update your password to keep your account secure.</p>
                      </div>
                      <button 
                        onClick={() => setIsPasswordModalOpen(true)}
                        className={`px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'}`}
                      >
                        Change Password
                      </button>
                   </div>
                   <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                      <p className="text-xs font-bold">💡 Tip: If you signed up with Google, you can set a password here to enable traditional email/password login.</p>
                   </div>
                </div>
             </div>

             {/* Appearance Section (Original) */}
             <div className={`rounded-[2.5rem] p-8 md:p-10 shadow-sm border ${theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'}`}>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10 flex items-center gap-2">
                   <Sun size={14} className="text-indigo-500" /> Appearance Mode
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <button onClick={() => toggleTheme('light')} className={`relative p-6 rounded-[2rem] border-2 text-left transition-all ${theme === 'light' ? 'border-indigo-600 bg-indigo-50/10' : 'border-transparent bg-slate-100/50 hover:bg-slate-100'}`}>
                      <div className="flex items-center justify-between mb-4">
                         <div className={`p-3 rounded-xl ${theme === 'light' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400'}`}><Sun size={20} /></div>
                         {theme === 'light' && <CheckCircle2 className="text-indigo-600" size={20} />}
                      </div>
                      <p className={`font-black text-sm mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-900'}`}>Light Theme</p>
                   </button>
                   <button onClick={() => toggleTheme('dark')} className={`relative p-6 rounded-[2rem] border-2 text-left transition-all ${theme === 'dark' ? 'border-indigo-600 bg-indigo-600/10' : 'border-transparent bg-slate-100/10 hover:bg-slate-800'}`}>
                      <div className="flex items-center justify-between mb-4">
                         <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}><Moon size={20} /></div>
                         {theme === 'dark' && <CheckCircle2 className="text-indigo-600" size={20} />}
                      </div>
                      <p className={`font-black text-sm mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Dark Theme</p>
                   </button>
                </div>
             </div>
          </div>
        </div>
      </main>

      {/* --- MODAL OVERLAYS --- */}
      
      {/* Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl transition-all ${theme === 'dark' ? 'bg-[#161b2b] border border-slate-800 text-white' : 'bg-white text-slate-900'}`}>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black">Update Profile</h3>
              <button onClick={() => setIsProfileModalOpen(false)} className="p-2 text-slate-400 hover:text-red-500"><X size={24}/></button>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Full Name</label>
                <input type="text" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} className={`w-full px-5 py-3 rounded-xl border outline-none font-bold ${theme === 'dark' ? 'bg-[#0b0f1a] border-slate-700 focus:border-indigo-500' : 'bg-slate-50 border-slate-200'}`} required />
              </div>
              <button type="submit" className="w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest bg-indigo-600 text-white hover:bg-indigo-500 transition-all">Save Profile</button>
            </form>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl transition-all ${theme === 'dark' ? 'bg-[#161b2b] border border-slate-800 text-white' : 'bg-white text-slate-900'}`}>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black">Change Password</h3>
              <button onClick={() => { setIsPasswordModalOpen(false); setPasswordData({ newPassword: '', confirmPassword: '' }); setShowNewPassword(false); }} className="p-2 text-slate-400 hover:text-red-500"><X size={24}/></button>
            </div>
            <form onSubmit={handleChangePassword} autoComplete="off" className="space-y-5">
              <input type="password" style={{display:'none'}} autoComplete="new-password" readOnly />
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">New Password</label>
                <div className="relative">
                  <input 
                    type={showNewPassword ? "text" : "password"} 
                    value={passwordData.newPassword} 
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} 
                    autoComplete="new-password"
                    className={`w-full px-5 py-3 rounded-xl border outline-none font-bold pr-12 ${theme === 'dark' ? 'bg-[#0b0f1a] border-slate-700 focus:border-indigo-500' : 'bg-slate-50 border-slate-200'}`} 
                    required 
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded ${theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-700'}`}>
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordData.newPassword.length > 0 && (
                  <div className="mt-2 space-y-1 px-1">
                    {passwordRules.map((rule) => (
                      <div key={rule.label} className={`flex items-center gap-2 text-xs font-bold transition-colors ${rule.test(passwordData.newPassword) ? 'text-emerald-500' : 'text-slate-400'}`}>
                        <span>{rule.test(passwordData.newPassword) ? '✓' : '✗'}</span>
                        <span>{rule.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Confirm New Password</label>
                <input type="password" autoComplete="new-password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} className={`w-full px-5 py-3 rounded-xl border outline-none font-bold ${theme === 'dark' ? 'bg-[#0b0f1a] border-slate-700 focus:border-indigo-500' : 'bg-slate-50 border-slate-200'}`} required />
                {passwordData.confirmPassword.length > 0 && (
                  <p className={`text-xs font-bold mt-1.5 ${passwordData.newPassword === passwordData.confirmPassword ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {passwordData.newPassword === passwordData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>
              <button disabled={!passwordRules.every(r => r.test(passwordData.newPassword))} type="submit" className="w-full mt-4 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20">Update Password</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherPreferences;