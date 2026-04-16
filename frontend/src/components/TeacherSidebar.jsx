import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ClipboardList,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const TeacherSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const sidebarItems = [
    { Icon: LayoutDashboard, label: 'Dashboard', path: '/teacher/dashboard' },
    { Icon: ClipboardList, label: 'My Exams', path: '/teacher/exams' },
    { Icon: BookOpen, label: 'My Courses', path: '/teacher/courses' },
    { Icon: BarChart3, label: 'Analytics', path: '/teacher/analytics' },
    { Icon: Settings, label: 'Preferences', path: '/teacher/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 p-4 flex justify-between items-center bg-slate-900 z-30 shadow-md h-16">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-black text-sm text-white">E</div>
          <h1 className="text-sm font-black tracking-tighter uppercase text-white">ExamFlow</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-white">
          <Menu size={20} />
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-white p-6 flex flex-col z-40 transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/20">E</div>
            <h1 className="text-xl font-black tracking-tighter uppercase">ExamFlow</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-200 ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <item.Icon size={18} /> <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-4 rounded-2xl font-bold text-sm text-red-400 hover:bg-red-500/10 transition-all mt-auto border border-transparent hover:border-red-500/20"
        >
          <LogOut size={18} /> <span>Logout</span>
        </button>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default TeacherSidebar;
