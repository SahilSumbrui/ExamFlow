import axios from "axios";

const API_URL = "https://examflow-2zqu.onrender.com/api";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
});

export const getStudentAnalytics = () =>
  axios.get(`${API_URL}/students/analytics`, authHeader());
