import API from './axios';

export const loginUser = (data) => API.post('/auth/login', data);
export const signupUser = (data) => API.post('/auth/signup', data);
