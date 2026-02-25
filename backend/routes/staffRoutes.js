const express = require("express");
const router = express.Router();
const {
    registerStaff,
    getStaffMembers,
    getStaffById,
    updateStaff,
    deleteStaff,
} = require("../controllers/staffController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.route("/")
    .post(protect, authorize("admin"), registerStaff)
    .get(protect, authorize("admin"), getStaffMembers);

router.route("/:id")
    .get(protect, authorize("admin"), getStaffById)
    .put(protect, authorize("admin"), updateStaff)
    .delete(protect, authorize("admin"), deleteStaff);

module.exports = router;
