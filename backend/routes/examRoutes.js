const express = require("express");
const router = express.Router();

const {
  createExam,
  getAllExams,
  getExamsByTeacher,
  getExamQuestions,
  getTeacherStats,
  getTeacherAnalytics,
  getExamById,
  updateExamStatus,
  updateExam
} = require("../controllers/examController");

const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

/* ================= TEACHER ROUTES ================= */

// Get teacher stats
router.get(
  "/teacher/stats",
  verifyToken,
  allowRoles("TEACHER"),
  getTeacherStats
);

// Get teacher analytics
router.get(
  "/teacher/analytics",
  verifyToken,
  allowRoles("TEACHER"),
  getTeacherAnalytics
);

// Create exam
router.post(
  "/create-exams",
  verifyToken,
  allowRoles("TEACHER"),
  createExam
);

// Get exams created by a teacher
router.get(
  "/teacher/:teacher_id",
  verifyToken,
  allowRoles("TEACHER"),
  getExamsByTeacher
);

/* ================= STUDENT ROUTES ================= */

// Get all exams (for students to view available exams)
router.get(
  "/",
  verifyToken,
  allowRoles("STUDENT", "TEACHER"),
  getAllExams
);

// Get exam questions (student during exam)
router.get(
  "/:exam_id/questions",
  verifyToken,
  allowRoles("STUDENT"),
  getExamQuestions
);

// Update exam status (specific route must come before generic)
router.put(
  "/:exam_id/status",
  verifyToken,
  allowRoles("TEACHER"),
  updateExamStatus
);

// Update exam details
router.put(
  "/:exam_id",
  verifyToken,
  allowRoles("TEACHER"),
  updateExam
);

// Get single exam by ID
router.get(
  "/:exam_id",
  verifyToken,
  allowRoles("TEACHER"),
  getExamById
);

module.exports = router;
