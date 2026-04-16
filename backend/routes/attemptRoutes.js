const express = require("express");
const router = express.Router();

const { startAttempt } = require("../controllers/attemptController");

router.post("/start", startAttempt);

module.exports = router;
