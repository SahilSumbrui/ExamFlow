const express = require("express");
const router = express.Router();
const {
  getTeacherCourses,
  createCourse,
  deleteCourse
} = require("../controllers/courseController");

const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

// Get teacher's courses
router.get(
  "/teacher/:teacher_id",
  verifyToken,
  allowRoles("TEACHER"),
  getTeacherCourses
);

// Create course
router.post(
  "/create",
  verifyToken,
  allowRoles("TEACHER"),
  createCourse
);

// Delete course
router.delete(
  "/:course_id",
  verifyToken,
  allowRoles("TEACHER"),
  deleteCourse
);

module.exports = router;
