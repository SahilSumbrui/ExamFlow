import API from './axios';

export const deleteQuestion = (question_id) => API.delete(`/questions/${question_id}`);
