const express = require("express");
const router = express.Router();
const {
    registerChild,
    getChildren,
    getChildById,
    updateChild,
    deleteChild,
} = require("../controllers/childController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.route("/")
    .post(protect, authorize("admin"), registerChild)
    .get(protect, authorize("admin"), getChildren);

router.route("/:id")
    .get(protect, authorize("admin"), getChildById)
    .put(protect, authorize("admin"), updateChild)
    .delete(protect, authorize("admin"), deleteChild);

module.exports = router;
