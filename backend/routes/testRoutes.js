const express = require("express");
const router = express.Router();

const {
  startTest,
  getQuestionsForTest,
  submitAnswer,
  endTest,
  getDescriptiveAnswers,
  evaluateAnswer,
  getStudentAttempts,
  getAttemptDetails,
  getResultByAttempt,
  calculateFinalScore,
  getExamSubmissions,
  logViolation,
  getResult,
  getLeaderboard,
  getGlobalLeaderboard,
  getExamResultsForTeacher,
  getViolationsForAttempt,
  getExamSummary,
  publishResults,
  getStudentAnalytics
} = require("../controllers/testController");

const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { verifyExamOwner } = require("../middleware/examOwnershipMiddleware");

/* ================= STUDENT ROUTES ================= */

// Start test
router.post(
  "/tests/start",
  verifyToken,
  allowRoles("STUDENT"),
  startTest
);

// Get questions for a test
router.get(
  "/tests/:attempt_id/questions",
  verifyToken,
  allowRoles("STUDENT"),
  getQuestionsForTest
);

// Submit answer
router.post(
  "/tests/submit-answer",
  verifyToken,
  allowRoles("STUDENT"),
  submitAnswer
);

// End test
router.post(
  "/tests/end",
  verifyToken,
  allowRoles("STUDENT"),
  endTest
);

// Student attempts list
router.get(
  "/students/:student_id/attempts",
  verifyToken,
  allowRoles("STUDENT"),
  getStudentAttempts
);

// Global leaderboard
router.get(
  "/students/leaderboard",
  verifyToken,
  allowRoles("STUDENT"),
  getGlobalLeaderboard
);

// Student analytics
router.get(
  "/students/analytics",
  verifyToken,
  allowRoles("STUDENT"),
  getStudentAnalytics
);

// View own attempt details
router.get(
  "/attempts/:attempt_id/details",
  verifyToken,
  allowRoles("STUDENT", "TEACHER"),
  getAttemptDetails
);

router.get(
  "/tests/results/:attempt_id",
  verifyToken,
  allowRoles("STUDENT"),
  getResultByAttempt
);


// Violations
router.post(
  "/tests/violation",
  verifyToken,
  allowRoles("STUDENT"),
  logViolation
);

/* ================= TEACHER ROUTES ================= */

router.get(
  "/tests/descriptive/:exam_id",
  verifyToken,
  allowRoles("TEACHER"),
  verifyExamOwner,
  getDescriptiveAnswers
);

router.post(
  "/tests/evaluate",
  verifyToken,
  allowRoles("TEACHER"),
  evaluateAnswer
);

router.post(
  "/tests/calculate-score",
  verifyToken,
  allowRoles("TEACHER"),
  calculateFinalScore
);

router.get(
  "/exams/:exam_id/submissions",
  verifyToken,
  allowRoles("TEACHER", "ADMIN"),
  verifyExamOwner,
  getExamSubmissions
);

// Result route for both STUDENT and TEACHER
router.get(
  "/results/:attempt_id", 
  verifyToken, 
  allowRoles("STUDENT", "TEACHER", "ADMIN"),
  getResult
);

router.get(
  "/leaderboard/:exam_id", 
  verifyToken, 
  allowRoles("STUDENT", "TEACHER", "ADMIN"), 
  getLeaderboard
);

router.get(
  "/exams/:exam_id/results", 
  verifyToken, 
  allowRoles("TEACHER", "ADMIN"),
  verifyExamOwner,
  getExamResultsForTeacher
);

router.post(
  "/exams/publish-results",
  verifyToken,
  allowRoles("TEACHER", "ADMIN"),
  verifyExamOwner,
  publishResults
);

router.get(
  "/attempts/:attempt_id/violations",
  verifyToken,
  allowRoles("TEACHER", "ADMIN"),
  verifyExamOwner,
  getViolationsForAttempt
);

router.get(
  "/exams/:exam_id/summary",
  verifyToken,
  allowRoles("TEACHER", "ADMIN"),
  verifyExamOwner,
  getExamSummary
);
module.exports = router;
