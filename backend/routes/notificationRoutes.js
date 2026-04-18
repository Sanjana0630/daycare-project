const express = require("express");
const router = express.Router();
const { protect, staff } = require("../middleware/authMiddleware");
const {
    sendReportNotification,
    getUnreadCount,
    getNotifications,
    markAsRead,
    deleteNotification
} = require("../controllers/notificationController");

router.post("/send-report", protect, staff, sendReportNotification);
router.get("/unread-count", protect, getUnreadCount);
router.get("/", protect, getNotifications); // For listing notifications
router.patch("/:id/read", protect, markAsRead);
router.delete("/:id", protect, deleteNotification);

module.exports = router;
