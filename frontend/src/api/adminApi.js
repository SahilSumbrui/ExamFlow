import axios from "axios";

const API_URL = "http://localhost:5000/api/admin";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
});

export const getAllUsers = () => axios.get(`${API_URL}/users`, authHeader());
export const deleteUser = (user_id) => axios.delete(`${API_URL}/users/${user_id}`, authHeader());
export const getAllExamsWithDetails = () => axios.get(`${API_URL}/exams`, authHeader());
export const deleteExam = (exam_id) => axios.delete(`${API_URL}/exams/${exam_id}`, authHeader());
export const getAllAttempts = () => axios.get(`${API_URL}/attempts`, authHeader());
export const getSystemStats = () => axios.get(`${API_URL}/stats`, authHeader());
export const getAttemptsOverTime = () => axios.get(`${API_URL}/chart/attempts-over-time`, authHeader());
export const getScoreDistribution = () => axios.get(`${API_URL}/chart/score-distribution`, authHeader());
