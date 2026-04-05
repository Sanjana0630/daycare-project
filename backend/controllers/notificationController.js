const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const Report = require("../models/Report");
const User = require("../models/User");
const Child = require("../models/Child");

/**
 * @desc    Send report notification to parent
 * @route   POST /api/notifications/send-report
 * @access  Private/Admin
 */
const sendReportNotification = async (req, res) => {
    try {
        const { parentId, childId, reportId, message } = req.body;

        if (!parentId || !childId || !reportId) {
            return res.status(400).json({ success: false, message: "Required fields (parentId, childId, reportId) are missing." });
        }

        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(parentId) || 
            !mongoose.Types.ObjectId.isValid(childId) || 
            !mongoose.Types.ObjectId.isValid(reportId)) {
            return res.status(400).json({ success: false, message: "Invalid ID format for Parent, Child, or Report." });
        }

        const adminId = req.user._id;
        if (!mongoose.Types.ObjectId.isValid(adminId)) {
            return res.status(401).json({ success: false, message: "Invalid Admin ID from session." });
        }

        // Explicitly cast to ObjectId
        const validParentId = new mongoose.Types.ObjectId(parentId);
        const validChildId = new mongoose.Types.ObjectId(childId);
        const validReportId = new mongoose.Types.ObjectId(reportId);
        const validAdminId = new mongoose.Types.ObjectId(adminId);

        // 2. Create the Notification record
        const newNotification = await Notification.create({
            parentId: validParentId,
            childId: validChildId,
            reportId: validReportId,
            generatedBy: validAdminId,
            type: "REPORT",
            message: message || "This is activity report of your child for selected period",
            isRead: false,
        });

        res.status(201).json({
            success: true,
            data: newNotification,
            message: "Report sent successfully."
        });
    } catch (error) {
        console.error("Error sending report notification:", error);
        res.status(500).json({ success: false, message: "Internal server error during notification handling." });
    }
};

/**
 * @desc    Get unread notification count for a parent
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
const getUnreadCount = async (req, res) => {
    try {
        const parentId = req.query.parentId || req.user._id;
        const count = await Notification.countDocuments({ parentId, isRead: false });

        res.status(200).json({
            success: true,
            count: count
        });
    } catch (error) {
        console.error("Error fetching unread count:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get all notifications for a parent
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = async (req, res) => {
    try {
        const parentId = req.user._id;
        const notifications = await Notification.find({ parentId })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Mark notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndUpdate(
            id,
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found." });
        }

        res.status(200).json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error("Error marking as read:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Delete a notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndDelete(id);

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found." });
        }

        res.status(200).json({ success: true, message: "Notification deleted successfully." });
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    sendReportNotification,
    getUnreadCount,
    getNotifications,
    markAsRead,
    deleteNotification
};
