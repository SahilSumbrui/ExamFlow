import API from './axios';

export const getTeacherStats = () => API.get('/exams/teacher/stats');
export const getTeacherExams = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return API.get(`/exams/teacher/${user.user_id}`);
};
export const getTeacherAnalytics = () => API.get('/exams/teacher/analytics');
