const express = require("express");
const router = express.Router();
const { getPublicFeedback } = require("../controllers/feedbackController");

// Public route for landing page reviews
router.get("/", getPublicFeedback);

module.exports = router;
