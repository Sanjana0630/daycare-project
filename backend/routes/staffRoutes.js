const express = require("express");
const router = express.Router();
const {
    registerStaff,
    getStaffMembers,
    getStaffById,
    updateStaff,
    deleteStaff,
} = require("../controllers/staffController");

router.route("/")
    .post(registerStaff)
    .get(getStaffMembers);

router.route("/:id")
    .get(getStaffById)
    .put(updateStaff)
    .delete(deleteStaff);

module.exports = router;
