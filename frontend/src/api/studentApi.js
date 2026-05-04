import API from './axios';

export const getStudentAnalytics = () => API.get('/students/analytics');
