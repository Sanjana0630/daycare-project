const User = require("../models/User");
const Child = require("../models/Child");
const Attendance = require("../models/Attendance");
const Activity = require("../models/Activity");
const Fee = require("../models/Fee");
const FeeStructure = require("../models/FeeStructure");
const Payment = require("../models/Payment");
const { calculateFee } = require("../utils/feeCalculator");
const Feedback = require("../models/Feedback");

// @desc    Get linked child for parent
// @route   GET /api/parent/child
// @access  Private/Parent
const getChildForParent = async (req, res) => {
    try {
        // Try searching by parent ID first, then by email as fallback
        let child = await Child.findOne({ parent: req.user._id }).populate("assignedTeacher assignedCaretaker");

        if (!child) {
            child = await Child.findOne({ parentEmail: req.user.email }).populate("assignedTeacher assignedCaretaker");
        }

        if (!child) {
            return res.status(200).json({ success: true, data: null, message: "No child assigned yet. Please contact admin." });
        }

        res.status(200).json({ success: true, data: child });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get child attendance (Current month only)
// @route   GET /api/parent/attendance/child/:id
// @access  Private/Parent
const getChildAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find({
            child: req.params.id
        }).sort({ date: -1 });

        res.status(200).json({ success: true, data: attendance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const getChildActivities = async (req, res) => {
    try {
        const ChildDailyActivity = require("../models/ChildDailyActivity");

        // Use normalized date logic consistent with staffController
        const getNormalizedDate = (dateParam) => {
            const d = dateParam ? new Date(dateParam) : new Date();
            const dateStr = new Intl.DateTimeFormat('en-CA', {
                timeZone: 'Asia/Kolkata',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).format(d);
            return new Date(`${dateStr}T00:00:00.000Z`);
        };

        const queryDate = getNormalizedDate();

        const dailyLog = await ChildDailyActivity.findOne({
            childId: req.params.id,
            date: queryDate
        }).populate("recordedBy", "name");

        // Format the data for the frontend
        if (!dailyLog) {
            return res.status(200).json({ success: true, data: [] });
        }

        const formattedActivities = dailyLog.activities.map(act => ({
            title: act.activityName,
            description: act.notes,
            completed: act.completed,
            rating: act.rating,
            staffName: dailyLog.recordedBy?.name || "Staff",
            timestamp: dailyLog.updatedAt // Use updatedAt as the time logged
        }));

        res.status(200).json({ success: true, data: formattedActivities });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get activities for parent's child (Direct specific format)
// @route   GET /api/parent/activities/parent
// @access  Private/Parent
const getParentActivitiesDirect = async (req, res) => {
    try {
        const ChildDailyActivity = require("../models/ChildDailyActivity");
        const Child = require("../models/Child");

        // 1. Find the child linked to this parent
        let child = await Child.findOne({ parent: req.user._id });
        if (!child) {
            child = await Child.findOne({ parentEmail: req.user.email });
        }

        if (!child) {
            return res.status(200).json({ success: true, data: null, message: "No child linked to your account" });
        }

        // 2. Fetch activities
        const { filter } = req.query; // today or week
        
        // Use normalized date logic consistent with staffController
        const getNormalizedDate = (dateParam) => {
            const d = dateParam ? new Date(dateParam) : new Date();
            const dateStr = new Intl.DateTimeFormat('en-CA', {
                timeZone: 'Asia/Kolkata',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).format(d);
            return new Date(`${dateStr}T00:00:00.000Z`);
        };

        let activitiesData = [];

        if (filter === 'week') {
            const today = getNormalizedDate();
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const logs = await ChildDailyActivity.find({
                childId: child._id,
                date: { $gte: sevenDaysAgo, $lte: today }
            }).sort({ date: -1 }).populate("recordedBy", "name");

            logs.forEach(log => {
                log.activities.forEach(act => {
                    activitiesData.push({
                        name: act.activityName,
                        status: act.completed ? "Completed" : "Pending",
                        rating: act.rating,
                        date: log.date,
                        notes: act.notes
                    });
                });
            });
        } else {
            // Default Today
            const queryDate = getNormalizedDate();
            const dailyLog = await ChildDailyActivity.findOne({
                childId: child._id,
                date: queryDate
            }).populate("recordedBy", "name");

            if (dailyLog) {
                activitiesData = dailyLog.activities.map(act => ({
                    name: act.activityName,
                    status: act.completed ? "Completed" : "Pending",
                    rating: act.rating,
                    date: dailyLog.date,
                    notes: act.notes
                }));
            }
        }

        res.status(200).json({
            success: true,
            childName: child.childName,
            activities: activitiesData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get child fees
// @route   GET /api/parent/fees/child/:id
// @access  Private/Parent
const getChildFees = async (req, res) => {
    try {
        const fees = await Fee.find({ child: req.params.id }).sort({ dueDate: -1 });
        res.status(200).json({ success: true, data: fees });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get child fee status (New Architecture)
// @route   GET /api/parent/fees/status
// @access  Private/Parent
const getParentFeeStatus = async (req, res) => {
    try {
        let child = await Child.findOne({ parent: req.user._id });
        if (!child) {
            child = await Child.findOne({ parentEmail: req.user.email });
        }

        if (!child) {
            return res.status(200).json({ success: true, data: null, message: "No linked child found." });
        }

        const currentDate = new Date();
        const numericMonth = req.query.month ? parseInt(req.query.month) : (currentDate.getMonth() + 1);
        const numericYear = req.query.year ? parseInt(req.query.year) : currentDate.getFullYear();

        // Expected base block
        const feeStructure = await FeeStructure.findOne({ class: child.class });
        const baseFee = feeStructure ? (feeStructure.monthlyFee + feeStructure.extraCharges) : 0;

        // Current Month Payments
        const payments = await Payment.find({ child: child._id, month: numericMonth, year: numericYear }).sort({ date: -1 });
        const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);

        // Determine effective evaluation date for late fees (stop accumulating if paid)
        let lastPaymentDate = null;
        if (payments.length > 0) {
            lastPaymentDate = new Date(Math.max(...payments.map(p => new Date(p.date))));
        }
        
        const evalDate = (paidAmount >= baseFee && lastPaymentDate) ? lastPaymentDate : null;

        const feeInfo = calculateFee(child, baseFee, numericYear, numericMonth, evalDate);
        const expectedFee = feeInfo.totalAmount;
        
        // Status Resolve
        let pendingAmount = expectedFee - paidAmount;
        let status = 'Pending';
        
        if (expectedFee > 0 && paidAmount >= expectedFee) {
            status = 'Paid';
            pendingAmount = 0;
        }

        if (status === 'Pending' && expectedFee > 0 && currentDate > feeInfo.graceEnd) {
            status = 'Overdue';
        }

        // Recent Payments (Last 5 overall)
        const recentPayments = await Payment.find({ child: child._id }).sort({ date: -1 }).limit(5);

        res.status(200).json({
            success: true,
            data: {
                childName: child.childName,
                class: child.class,
                admissionDate: child.admissionDate,
                month: numericMonth,
                year: numericYear,
                expectedFee,
                baseFee: feeInfo.baseFee,
                lateFee: feeInfo.lateFee,
                dueDate: feeInfo.dueDate,
                paidAmount,
                pendingAmount: pendingAmount > 0 ? pendingAmount : 0,
                status,
                recentPayments
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Record parent fee payment
// @route   POST /api/parent/fees/pay
// @access  Private/Parent
const recordParentPayment = async (req, res) => {
    try {
        const { amount, mode, month, year } = req.body;

        let child = await Child.findOne({ parent: req.user._id });
        if (!child) {
            child = await Child.findOne({ parentEmail: req.user.email });
        }

        if (!child) {
            return res.status(404).json({ success: false, message: "No linked child found." });
        }

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({ success: false, message: "Valid amount is required" });
        }

        const currentDate = new Date();
        
        const newPayment = await Payment.create({
            child: child._id,
            amount: numericAmount,
            date: currentDate,
            month: month ? parseInt(month) : (currentDate.getMonth() + 1),
            year: year ? parseInt(year) : currentDate.getFullYear(),
            mode
        });

        res.status(201).json({ success: true, message: "Payment recorded successfully", data: newPayment });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Submit feedback
// @route   POST /api/parent/feedback
// @access  Private/Parent
const submitFeedback = async (req, res) => {
    try {
        const { childId, rating, category, message } = req.body;

        if (!childId || !rating || !category || !message) {
            return res.status(400).json({ success: false, message: "Please provide all required fields" });
        }

        const feedback = await Feedback.create({
            parent: req.user._id,
            child: childId,
            rating,
            category,
            message
        });

        res.status(201).json({
            success: true,
            message: "Feedback submitted successfully",
            data: feedback
        });
    } catch (error) {
        console.error('Error in submitFeedback:', error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get my feedback
// @route   GET /api/parent/feedback
// @access  Private/Parent
const getMyFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find({ parent: req.user._id })
            .populate("child", "childName")
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            count: feedback.length,
            data: feedback
        });
    } catch (error) {
        console.error('Error in getMyFeedback:', error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get parent profile
// @route   GET /api/parent/me
// @access  Private/Parent
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Update parent profile
// @route   PUT /api/parent/update
// @access  Private/Parent
const updateProfile = async (req, res) => {
    try {
        const { fullName, phoneNumber, address, profileImage } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.fullName = fullName || user.fullName;
        user.phoneNumber = phoneNumber || user.phoneNumber;
        user.address = address || user.address;
        user.profileImage = profileImage || user.profileImage;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                address: user.address,
                profileImage: user.profileImage
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    getChildForParent,
    getChildAttendance,
    getChildActivities,
    getChildFees,
    getParentActivitiesDirect,
    getParentFeeStatus,
    recordParentPayment,
    submitFeedback,
    getMyFeedback
};
