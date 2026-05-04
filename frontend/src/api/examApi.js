import API from './axios';

export const createExam = (examData) => API.post('/exams/create-exams', examData);
