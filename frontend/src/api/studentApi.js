import axios from "axios";

const API_URL = "http://localhost:5000/api";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
});

export const getStudentAnalytics = () =>
  axios.get(`${API_URL}/students/analytics`, authHeader());
