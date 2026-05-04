import API from './axios';

export const getTeacherCourses = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return API.get(`/courses/teacher/${user.user_id}`);
};
export const createCourse = (courseData) => API.post('/courses/create', courseData);
export const deleteCourse = (course_id) => API.delete(`/courses/${course_id}`);
