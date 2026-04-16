const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/create-Question",verifyToken, questionController.createQuestion);
router.get("/:question_id", verifyToken, questionController.getQuestionById);
router.put("/:question_id", verifyToken, questionController.updateQuestion);
router.delete("/:question_id", verifyToken, questionController.deleteQuestion);

module.exports = router;
