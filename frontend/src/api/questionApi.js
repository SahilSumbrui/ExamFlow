import axios from "axios";

const API_URL = "https://examflow-2zqu.onrender.com/api/questions";

export const deleteQuestion = async (question_id) => {
  const token = localStorage.getItem("token");
  return axios.delete(`${API_URL}/${question_id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
