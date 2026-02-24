const express = require("express");
const router = express.Router();
const { loginUser, registerUser, getParents } = require("../controllers/authController");

router.post("/login", loginUser);
router.post("/register", registerUser);
router.get("/parents", getParents);

module.exports = router;
