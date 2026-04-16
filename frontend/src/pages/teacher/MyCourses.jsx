import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../App';
import { getTeacherCourses, createCourse, deleteCourse } from '../../api/courseApi';
import TeacherSidebar from '../../components/TeacherSidebar';
import {
  ArrowLeft,
  Plus,
  BookOpen,
  Loader2,
  Trash2,
  FileText,
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';

const XIcon = ({ className, size }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const MyCourses = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [courseForm, setCourseForm] = useState({
    course_name: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await getTeacherCourses();
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await createCourse(courseForm);
      setCourseForm({ course_name: '' });
      setShowCreateModal(false);
      fetchCourses();
    } catch (error) {
      console.error('Error creating course:', error);
      alert(error.response?.data?.message || 'Failed to create course');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCourse = async (course_id) => {
    if (!window.confirm('Are you sure you want to delete this course? All associated exams will also be deleted.')) return;
    try {
      await deleteCourse(course_id);
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      if (error.response?.status === 400) {
        alert('Cannot delete course: It has associated exams. Delete the exams first.');
      } else {
        alert(error.response?.data?.message || 'Failed to delete course');
      }
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0b0f1a]' : 'bg-slate-50'}`}>
      <TeacherSidebar />

      <div className="lg:pl-64 pt-20 md:pt-20 lg:pt-0 p-6 md:p-8 lg:pl-72 lg:pr-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div>
            <h2 className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>My Courses</h2>
            <p className="text-slate-500 font-medium">Manage your teaching courses</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className={`flex items-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl ${
              theme === 'dark' ? 'shadow-indigo-500/20' : 'shadow-indigo-200'
            }`}
          >
            <Plus size={20} /> Create Course
          </button>
        </header>

        {/* Courses Grid */}
        {loading ? (
          <div className={`rounded-[3rem] border shadow-sm p-20 text-center ${
            theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <Loader2 className="animate-spin mx-auto text-indigo-600 mb-4" size={40} />
            <p className="text-slate-400 font-medium">Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className={`rounded-[3rem] border shadow-sm p-20 text-center ${
            theme === 'dark' ? 'bg-[#161b2b] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <BookOpen className="mx-auto text-slate-200 mb-4" size={48} />
            <h3 className={`font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>No Courses Yet</h3>
            <p className="text-slate-400 text-sm mb-6">Create your first course to start organizing exams.</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
            >
              Create Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div 
                key={course.course_id}
                className={`rounded-[2.5rem] border shadow-sm p-8 transition-all group ${
                  theme === 'dark' ? 'bg-[#161b2b] border-slate-800 hover:border-indigo-500' : 'bg-white border-slate-200 hover:border-indigo-200'
                }`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform ${
                    theme === 'dark' ? 'bg-indigo-500/20' : 'bg-indigo-50'
                  }`}>
                    <BookOpen size={24} />
                  </div>
                  <button 
                    onClick={() => handleDeleteCourse(course.course_id)}
                    className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <h3 className={`text-xl font-black mb-2 group-hover:text-indigo-600 transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>
                  {course.course_name}
                </h3>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Course ID:</span>
                  <p className={`font-bold text-sm font-mono px-3 py-1 rounded-lg ${
                    theme === 'dark' ? 'text-white bg-slate-800' : 'text-slate-900 bg-slate-100'
                  }`}>
                    {course.course_id}
                  </p>
                </div>
                <div className={`mt-6 pt-6 border-t flex items-center gap-2 text-slate-400 text-sm ${
                  theme === 'dark' ? 'border-slate-800' : 'border-slate-100'
                }`}>
                  <FileText size={16} />
                  <span className="font-medium">{course.exam_count || 0} Exams</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`rounded-[3.5rem] p-12 w-full max-w-lg shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-8 duration-500 ${
            theme === 'dark' ? 'bg-[#161b2b]' : 'bg-white'
          }`}>
            <div className="absolute top-0 left-0 w-full h-3 bg-indigo-600" />
            
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className={`text-3xl font-black mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>New Course</h3>
                <p className="text-slate-500 font-medium">Add a course to your teaching portfolio</p>
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

            <form onSubmit={handleCreateCourse} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block tracking-widest">Course Name</label>
                <input 
                  type="text" 
                  required 
                  className={`w-full p-5 border rounded-[1.5rem] outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium ${
                    theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`} 
                  placeholder="e.g. Introduction to Computer Science" 
                  value={courseForm.course_name} 
                  onChange={e => setCourseForm({...courseForm, course_name: e.target.value})} 
                />
              </div>
              
              <div className="flex gap-4 mt-8">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)} 
                  className={`flex-1 py-5 rounded-[2rem] font-bold transition ${
                    theme === 'dark' ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Cancel
                </button>
                <button 
                  disabled={isCreating}
                  type="submit"
                  className={`flex-1 py-5 text-white rounded-[2rem] font-bold transition shadow-xl flex items-center justify-center gap-3 ${
                    theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'
                  }`}
                >
                  {isCreating ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                  <span>{isCreating ? "Creating..." : "Create Course"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCourses;
