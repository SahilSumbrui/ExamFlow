const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  deleteUser,
  getAllExamsWithDetails,
  deleteExam,
  getAllAttempts,
  getSystemStats,
  getAttemptsOverTime,
  getScoreDistribution,
  getStudentAnalytics,
  getTeacherExams
} = require("../controllers/adminController");

const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

// Get system stats
router.get(
  "/stats",
  verifyToken,
  allowRoles("ADMIN"),
  getSystemStats
);

router.get(
  "/users",
  verifyToken,
  allowRoles("ADMIN"),
  getAllUsers
);

router.delete(
  "/users/:user_id",
  verifyToken,
  allowRoles("ADMIN"),
  deleteUser
);

router.get(
  "/exams",
  verifyToken,
  allowRoles("ADMIN"),
  getAllExamsWithDetails
);

router.delete(
  "/exams/:exam_id",
  verifyToken,
  allowRoles("ADMIN"),
  deleteExam
);

router.get(
  "/attempts",
  verifyToken,
  allowRoles("ADMIN"),
  getAllAttempts
);

router.get(
  "/chart/attempts-over-time",
  verifyToken,
  allowRoles("ADMIN"),
  getAttemptsOverTime
);

router.get(
  "/chart/score-distribution",
  verifyToken,
  allowRoles("ADMIN"),
  getScoreDistribution
);

router.get(
  "/student-analytics/:studentId",
  verifyToken,
  allowRoles("ADMIN"),
  getStudentAnalytics
);

router.get(
  "/teacher/:teacherId/exams",
  verifyToken,
  allowRoles("ADMIN"),
  getTeacherExams
);

module.exports = router;
