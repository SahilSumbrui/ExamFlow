import axios from "axios";

const API_URL = "https://examflow-2zqu.onrender.com/api/exams";

// Get teacher stats
export const getTeacherStats = async () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_URL}/teacher/stats`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Get teacher's exams
export const getTeacherExams = async () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  return axios.get(`${API_URL}/teacher/${user.user_id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Get teacher analytics
export const getTeacherAnalytics = async () => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_URL}/teacher/analytics`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
