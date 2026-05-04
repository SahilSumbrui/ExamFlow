import API from './axios';

export const getAllUsers = () => API.get('/admin/users');
export const deleteUser = (user_id) => API.delete(`/admin/users/${user_id}`);
export const getAllExamsWithDetails = () => API.get('/admin/exams');
export const deleteExam = (exam_id) => API.delete(`/admin/exams/${exam_id}`);
export const getAllAttempts = () => API.get('/admin/attempts');
export const getSystemStats = () => API.get('/admin/stats');
export const getAttemptsOverTime = () => API.get('/admin/chart/attempts-over-time');
export const getScoreDistribution = () => API.get('/admin/chart/score-distribution');
export const getPendingTeachers = () => API.get('/admin/pending-teachers');
export const approveTeacher = (user_id) => API.post('/admin/approve-teacher', { user_id });
export const rejectTeacher = (user_id) => API.post('/admin/reject-teacher', { user_id });
