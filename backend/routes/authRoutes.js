const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");
const {signup, login, verifyEmail} = require("../controllers/authController");  

router.post("/login", authController.login);
router.post("/signup", authController.signup);
router.post("/google", authController.googleAuth);
router.get("/users/:user_id", verifyToken, authController.getUserProfile);
router.put("/users/:user_id", verifyToken, authController.updateProfile);
router.put("/change-password", verifyToken, authController.changePassword);
router.get("/verify/:token", authController.verifyEmail);

module.exports = router;
