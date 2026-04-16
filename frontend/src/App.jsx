import React, { createContext, useContext, useState, useEffect } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import StudentDashboard from "./pages/student/StudentDashboard";
import MyResultsContent from "./pages/student/Results";
import Leaderboard from "./pages/student/Leaderboard";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSettings from "./pages/admin/AdminSettings";
import QuestionBuilder from "./pages/teacher/QuestionBuilder";
import ExamRoomContent from "./pages/student/Exam";
import StudentResultContent from "./pages/student/StudenResult";
import ExamDetailsContent from "./pages/teacher/ExamDetails";
import MyExams from "./pages/teacher/MyExams";
import MyCourses from "./pages/teacher/MyCourses";
import Analytics from "./pages/teacher/Analytics";
import SubmissionsContent from "./pages/teacher/Submissions";
import SubmissionDetailContent from "./pages/teacher/SubmissionDetail";
import Preferences from "./pages/student/StudentSettings";
import StudentAnalysis from "./pages/student/StudentAnalysis";
import TeacherPreferences from "./pages/teacher/teacherSettings";
import VerifyEmail from "./pages/VerifyEmail";

export const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

const ThemeProvider = ({ children }) => {
  const getUserId = () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user).user_id : 'default';
    } catch {
      return 'default';
    }
  };

  const [theme, setTheme] = useState(() => {
    const userId = getUserId();
    return localStorage.getItem(`examflow-theme-${userId}`) || 'light';
  });

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
    const userId = getUserId();
    localStorage.setItem(`examflow-theme-${userId}`, newTheme);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Reload theme when user changes (login/logout)
  useEffect(() => {
    const checkUserChange = () => {
      const userId = getUserId();
      const userTheme = localStorage.getItem(`examflow-theme-${userId}`) || 'light';
      if (userTheme !== theme) {
        setTheme(userTheme);
      }
    };

    // Check on mount and when storage changes
    checkUserChange();
    
    const interval = setInterval(checkUserChange, 500);
    return () => clearInterval(interval);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`min-h-screen transition-colors duration-500 ease-in-out ${
        theme === 'dark' ? 'bg-[#0b0f1a] text-white' : 'bg-slate-50 text-slate-900'
      }`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        
        <Route path="/student/dashboard" element={
          <ProtectedRoute role="STUDENT">
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/student/results" element={
          <ProtectedRoute role="STUDENT">
            <MyResultsContent />
          </ProtectedRoute>
        } />
        <Route path="/student/leaderboard/:examId" element={
          <ProtectedRoute role="STUDENT">
            <Leaderboard />
          </ProtectedRoute>
        } />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/student/exam/:attemptId" element={
          <ProtectedRoute role="STUDENT">
            <ExamRoomContent />
          </ProtectedRoute>
        } />
        <Route path="/student/result/:attemptId" element={
          <ProtectedRoute role="STUDENT">
            <StudentResultContent />
          </ProtectedRoute>
        } />
        <Route path="/student/Settings" element={
          <ProtectedRoute role="STUDENT">
            <Preferences />
          </ProtectedRoute>
        } />
        <Route path="/student/analytics" element={
          <ProtectedRoute role="STUDENT">
            <StudentAnalysis />
          </ProtectedRoute>
        } />

        <Route path="/teacher/dashboard" element={
          <ProtectedRoute role="TEACHER">
            <TeacherDashboard />
          </ProtectedRoute>
        } />
        <Route path="/teacher/exams" element={
          <ProtectedRoute role="TEACHER">
            <MyExams />
          </ProtectedRoute>
        } />
        <Route path="/teacher/courses" element={
          <ProtectedRoute role="TEACHER">
            <MyCourses />
          </ProtectedRoute>
        } />
        <Route path="/teacher/analytics" element={
          <ProtectedRoute role="TEACHER">
            <Analytics />
          </ProtectedRoute>
        } />
        <Route path="/teacher/builder" element={
          <ProtectedRoute role="TEACHER">
            <QuestionBuilder />
          </ProtectedRoute>
        } />
        <Route path="/teacher/builder/:question_id" element={
          <ProtectedRoute role="TEACHER">
            <QuestionBuilder />
          </ProtectedRoute>
        } />
        <Route path="/teacher/exam/:examId" element={
          <ProtectedRoute role="TEACHER">
            <ExamDetailsContent />
          </ProtectedRoute>
        } />
        <Route path="/teacher/submissions/:examId" element={
          <ProtectedRoute role="TEACHER">
            <SubmissionsContent />
          </ProtectedRoute>
        } />
        <Route path="/teacher/submission/:attemptId" element={
          <ProtectedRoute role="TEACHER">
            <SubmissionDetailContent />
          </ProtectedRoute>
        } />

        <Route path="/teacher/settings" element={
          <ProtectedRoute role="TEACHER">
            <TeacherPreferences />
          </ProtectedRoute>
        } />

        <Route path="/admin/dashboard" element={
          <ProtectedRoute role="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/admin/settings" element={
          <ProtectedRoute role="ADMIN">
            <AdminSettings />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
