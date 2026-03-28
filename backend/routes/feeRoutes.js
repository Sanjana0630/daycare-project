const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");

const {
    setFeeStructure,
    getFeeStructures,
    getFeesDashboard,
    recordPayment,
    sendReminder
} = require("../controllers/feeController");

// Admin routes for fees
router.post("/structure", protect, admin, setFeeStructure);
router.get("/structure", protect, admin, getFeeStructures);
router.get("/dashboard", protect, admin, getFeesDashboard);
router.post("/payment", protect, admin, recordPayment);
router.post("/remind", protect, admin, sendReminder);

module.exports = router;
