const express = require("express");
const router = express.Router();
const { addChild, getStaff } = require("../controllers/childController");

// Note: In a real app, we should add auth/admin middleware here
router.post("/", addChild);
router.get("/staff", getStaff);

module.exports = router;
