import axios from "axios";

const API_URL = "http://localhost:5000/api/exams";

// Create exam
export const createExam = async (examData) => {
  const token = localStorage.getItem("token");
  return axios.post(`${API_URL}/create-exams`, examData, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
