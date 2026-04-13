const express = require("express");
const router = express.Router();
const { loginUser, registerUser, getParents, getMe, googleAuth } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/google", googleAuth);
router.get("/parents", getParents);
router.get("/me", protect, getMe);

module.exports = router;
