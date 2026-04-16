import axios from "axios";

const API_URL = "http://localhost:5000/api/courses";

// Get teacher's courses
export const getTeacherCourses = async () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  return axios.get(`${API_URL}/teacher/${user.user_id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Create course
export const createCourse = async (courseData) => {
  const token = localStorage.getItem("token");
  return axios.post(`${API_URL}/create`, courseData, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Delete course
export const deleteCourse = async (course_id) => {
  const token = localStorage.getItem("token");
  return axios.delete(`${API_URL}/${course_id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
