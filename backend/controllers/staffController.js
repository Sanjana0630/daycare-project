const Staff = require("../models/Staff");

// Timezone helpers to ensure Render server matches Localhost behavior
const getCurrentTimeIST = () => {
    return new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(new Date());
};

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

// @desc    Register a new staff member
// @route   POST /api/staff
// @access  Public
const registerStaff = async (req, res) => {
    try {
        console.log('Received staff registration request:', req.body);
        const staff = await Staff.create(req.body);
        console.log('Staff member created successfully:', staff._id);
        res.status(201).json({
            success: true,
            data: staff,
            message: "Staff member registered successfully",
        });
    } catch (error) {
        console.error('Error creating staff member:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get all staff members
// @route   GET /api/staff
// @access  Public
const getStaffMembers = async (req, res) => {
    try {
        const staff = await Staff.find({});
        console.log(`--- BACKEND: Fetched ${staff.length} staff records from database ---`);
        res.status(200).json({
            success: true,
            count: staff.length,
            data: staff,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get staff member by ID
// @route   GET /api/staff/:id
// @access  Public
const getStaffById = async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id);

        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff member not found" });
        }

        res.status(200).json({ success: true, data: staff });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Update staff member
// @route   PUT /api/staff/:id
// @access  Public
const updateStaff = async (req, res) => {
    try {
        let staff = await Staff.findById(req.params.id);

        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff member not found" });
        }

        staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({ success: true, data: staff });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Delete staff member
// @route   DELETE /api/staff/:id
// @access  Public
const deleteStaff = async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id);

        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff member not found" });
        }

        await staff.deleteOne();

        res.status(200).json({ success: true, data: {}, message: "Staff member removed" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const getStaffChildren = async (req, res) => {
    try {
        const staffMember = await Staff.findOne({ email: req.user.email });
        if (!staffMember) {
            return res.status(404).json({ success: false, message: "Staff record not found" });
        }

        const Child = require("../models/Child");
        const children = await Child.find({
            $or: [
                { assignedTeacher: staffMember._id },
                { assignedCaretaker: staffMember._id }
            ]
        });

        res.status(200).json({ success: true, count: children.length, data: children });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const markChildAttendance = async (req, res) => {
    try {
        const { childId, status, date, remarks, checkIn, checkOut } = req.body;
        const Attendance = require("../models/Attendance");
        const Staff = require("../models/Staff");

        const staffMember = await Staff.findOne({ email: req.user.email });
        if (!staffMember) {
            return res.status(404).json({ success: false, message: "Staff record not found" });
        }

        // Use the raw date param for matching today if that's what the client sends
        // getNormalizedDate strips time to local midnight UTC
        const attendanceDate = getNormalizedDate(date);

        const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(date ? new Date(date) : new Date());
        const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());

        if (dateStr !== todayStr) {
            return res.status(400).json({ success: false, message: "Attendance can only be marked for today." });
        }

        const updateData = { status, remarks, checkIn, checkOut, markedBy: staffMember._id, markedAt: new Date() };

        const attendance = await Attendance.findOneAndUpdate(
            { child: childId, date: attendanceDate },
            updateData,
            { new: true, upsert: true }
        );

        res.status(200).json({ success: true, data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getChildrenAttendance = async (req, res) => {
    try {
        const staffMember = await Staff.findOne({ email: req.user.email });
        if (!staffMember) {
            return res.status(404).json({ success: false, message: "Staff record not found" });
        }

        const Child = require("../models/Child");
        const Attendance = require("../models/Attendance");

        // 1. Get children assigned to the staff 
        const children = await Child.find({
            $or: [
                { assignedTeacher: staffMember._id },
                { assignedCaretaker: staffMember._id }
            ]
        });

        const childIds = children.map(c => c._id);
        const queryDate = req.query.date ? getNormalizedDate(req.query.date) : getNormalizedDate();
        const endOfDay = new Date(queryDate.getTime() + 24 * 60 * 60 * 1000);

        // 2. Fetch the attendance records across these children for the specified date
        const attendance = await Attendance.find({
            child: { $in: childIds },
            date: { $gte: queryDate, $lt: endOfDay }
        });

        res.status(200).json({ success: true, count: attendance.length, data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAttendanceHistory = async (req, res) => {
    try {
        const staffMember = await Staff.findOne({ email: req.user.email });
        if (!staffMember) {
            return res.status(404).json({ success: false, message: "Staff record not found" });
        }

        const Child = require("../models/Child");
        const Attendance = require("../models/Attendance");

        // 1. Get children assigned to the staff 
        const children = await Child.find({
            $or: [
                { assignedTeacher: staffMember._id },
                { assignedCaretaker: staffMember._id }
            ]
        });

        const childIds = children.map(c => c._id);

        // 2. Fetch recent attendance records for these children
        const history = await Attendance.find({
            child: { $in: childIds }
        })
            .populate("child", "childName parentName")
            .populate("markedBy", "name")
            .sort({ markedAt: -1, date: -1 })
            .limit(50); // Fetch last 50 records for performance

        res.status(200).json({ success: true, count: history.length, data: history });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addStaffActivity = async (req, res) => {
    try {
        const Activity = require("../models/Activity");
        const activity = await Activity.create(req.body);
        res.status(201).json({ success: true, data: activity });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getScheduleActivities = async (req, res) => {
    try {
        const ScheduleActivity = require("../models/ScheduleActivity");
        const { date } = req.query;
        const queryDate = getNormalizedDate(date);

        const endOfDay = new Date(queryDate.getTime() + 24 * 60 * 60 * 1000);

        const storedActivities = await ScheduleActivity.find({
            date: { $gte: queryDate, $lt: endOfDay }
        });

        const defaultActivities = [
            { name: "Morning Prayer", startTime: "09:00", endTime: "09:30" },
            { name: "Learning Session", startTime: "09:30", endTime: "10:30" },
            { name: "Snack Time", startTime: "10:30", endTime: "11:00" },
            { name: "Play Time", startTime: "11:00", endTime: "12:00" },
            { name: "Story Time", startTime: "12:00", endTime: "12:30" },
            { name: "Lunch Time", startTime: "12:30", endTime: "13:00" },
            { name: "Nap Time", startTime: "13:00", endTime: "15:00" }
        ];

        const currentTimeStr = getCurrentTimeIST();
        const todayStart = getNormalizedDate();
        const isToday = queryDate.getTime() === todayStart.getTime();

        const mergedActivities = defaultActivities.map(def => {
            const stored = storedActivities.find(a => a.name === def.name && a.isDefault);
            if (stored) return stored;

            let status = "Pending";
            if (isToday) {
                if (currentTimeStr > def.endTime) status = "Missed";
            } else if (queryDate < todayStart) {
                status = "Missed";
            }

            return {
                ...def,
                status,
                isDefault: true,
                _id: `default-${def.name.replace(/\s+/g, '-').toLowerCase()}`
            };
        });

        const customActivities = storedActivities.filter(a => !a.isDefault).map(a => {
            const obj = a.toObject ? a.toObject() : a;
            if (obj.status === "Pending" && isToday && currentTimeStr > obj.endTime) {
                return { ...obj, status: "Missed" };
            }
            return obj;
        });

        // Optional: deduplicate custom activities by name to avoid displaying the duplicated bug records
        // but wait, if a user intentionally creates two custom activities with the same name but different times, this would break.
        // Let's deduplicate by name AND start time to be safe.
        const uniqueCustomsMap = new Map();
        for (const c of customActivities) {
            const key = `${c.name}-${c.startTime}`;
            // If there's a duplicate, keep the one that was updated most recently (likely the one marked completed)
            if (!uniqueCustomsMap.has(key) || c.updatedAt > uniqueCustomsMap.get(key).updatedAt) {
                uniqueCustomsMap.set(key, c);
            }
        }
        const uniqueCustoms = Array.from(uniqueCustomsMap.values());

        res.status(200).json({
            success: true,
            data: [...mergedActivities, ...uniqueCustoms].sort((a, b) => a.startTime.localeCompare(b.startTime))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const markScheduleActivityCompleted = async (req, res) => {
    try {
        const ScheduleActivity = require("../models/ScheduleActivity");
        const { _id, name, date, startTime, endTime, isDefault } = req.body;

        const activityDate = getNormalizedDate(date);

        let activity;

        if (!isDefault && _id && typeof _id === 'string' && !_id.startsWith('default-')) {
            activity = await ScheduleActivity.findByIdAndUpdate(
                _id,
                { status: "Completed" },
                { new: true }
            );
        } else {
            activity = await ScheduleActivity.findOneAndUpdate(
                { name, date: activityDate, createdBy: req.user._id, isDefault: true },
                { name, date: activityDate, startTime, endTime, status: "Completed", isDefault: true, createdBy: req.user._id },
                { new: true, upsert: true }
            );
        }

        res.status(200).json({ success: true, data: activity });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addCustomScheduleActivity = async (req, res) => {
    try {
        const ScheduleActivity = require("../models/ScheduleActivity");

        const activityDate = getNormalizedDate(req.body.date);

        const activity = await ScheduleActivity.create({
            ...req.body,
            date: activityDate,
            createdBy: req.user._id,
            isDefault: false,
            status: "Pending"
        });
        res.status(201).json({ success: true, data: activity });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteScheduleActivity = async (req, res) => {
    try {
        const ScheduleActivity = require("../models/ScheduleActivity");
        const activity = await ScheduleActivity.findById(req.params.id);

        if (!activity) {
            return res.status(404).json({ success: false, message: "Activity not found" });
        }

        if (activity.isDefault) {
            return res.status(400).json({ success: false, message: "Cannot delete default activities" });
        }

        await activity.deleteOne();

        res.status(200).json({ success: true, data: {}, message: "Activity removed" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getStaffDashboardSummary = async (req, res) => {
    try {
        const staff = await Staff.findOne({ email: req.user.email });
        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff record not found" });
        }

        const Child = require("../models/Child");
        const Attendance = require("../models/Attendance");
        const Activity = require("../models/Activity");
        const ScheduleActivity = require("../models/ScheduleActivity");

        const children = await Child.find({
            $or: [
                { assignedTeacher: staff._id },
                { assignedCaretaker: staff._id }
            ]
        });

        const childIds = children.map(c => c._id);

        // Use normalized IST dates to prevent counting bugs on Render vs Localhost
        const today = getNormalizedDate();
        const endOfToday = new Date(today.getTime() + 24 * 60 * 60 * 1000);

        const attendance = await Attendance.find({
            child: { $in: childIds },
            date: {
                $gte: today,
                $lt: endOfToday
            }
        });

        const presentToday = attendance.filter(a => a.status === 'Present').length;
        const absentToday = attendance.filter(a => a.status === 'Absent').length;
        const pendingToday = children.length - presentToday - absentToday;

        // Schedule activities counts
        const storedSchedule = await ScheduleActivity.find({
            date: { $gte: today, $lt: endOfToday }
        });

        const defaultActivities = [
            { name: "Morning Prayer", endTime: "09:30" },
            { name: "Learning Session", endTime: "10:30" },
            { name: "Snack Time", endTime: "11:00" },
            { name: "Play Time", endTime: "12:00" },
            { name: "Story Time", endTime: "12:30" },
            { name: "Lunch Time", endTime: "13:00" },
            { name: "Nap Time", endTime: "15:00" }
        ];

        const currentTimeStr = getCurrentTimeIST();

        let completed = 0;
        let missed = 0;
        let pending = 0;

        defaultActivities.forEach(def => {
            const stored = storedSchedule.find(s => s.name === def.name && s.isDefault);
            if (stored) {
                if (stored.status === "Completed") completed++;
                else if (stored.status === "Missed") missed++;
                else pending++;
            } else {
                if (currentTimeStr > def.endTime) missed++;
                else pending++;
            }
        });

        // Deduplicate custom activities to prevent inflated stats from old duplicates
        // Deduplicate by name and start time. Keep the most recently updated one.
        let customActivities = storedSchedule.filter(s => !s.isDefault);
        const uniqueCustomsMap = new Map();
        for (const c of customActivities) {
            const key = `${c.name}-${c.startTime}`;
            if (!uniqueCustomsMap.has(key) || c.updatedAt > uniqueCustomsMap.get(key).updatedAt) {
                uniqueCustomsMap.set(key, c);
            }
        }
        customActivities = Array.from(uniqueCustomsMap.values());

        customActivities.forEach(s => {
            if (s.status === "Completed") completed++;
            else if (s.status === "Missed" || (s.status === "Pending" && currentTimeStr > s.endTime)) missed++;
            else pending++;
        });

        res.status(200).json({
            success: true,
            data: {
                totalChildren: children.length,
                pendingToday: pendingToday > 0 ? pendingToday : 0,
                presentToday,
                absentToday,
                scheduleStats: {
                    total: defaultActivities.length + customActivities.length,
                    completed,
                    pending,
                    missed
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getMyProfile = async (req, res) => {
    try {
        const staff = await Staff.findOne({ email: req.user.email });
        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff record not found" });
        }
        res.status(200).json({ success: true, data: staff });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateMyProfile = async (req, res) => {
    try {
        const staff = await Staff.findOneAndUpdate(
            { email: req.user.email },
            { ...req.body, email: req.user.email },
            { new: true, runValidators: true, upsert: true }
        );
        res.status(200).json({ success: true, data: staff });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const logChildDailyActivity = async (req, res) => {
    try {
        const ChildDailyActivity = require("../models/ChildDailyActivity");
        const { childId, date, activities } = req.body;

        const staffMember = await Staff.findOne({ email: req.user.email });
        if (!staffMember) {
            return res.status(404).json({ success: false, message: "Staff record not found" });
        }

        const activityDate = getNormalizedDate(date);

        const dailyLog = await ChildDailyActivity.findOneAndUpdate(
            { childId, date: activityDate },
            {
                childId,
                date: activityDate,
                activities,
                recordedBy: staffMember._id
            },
            { new: true, upsert: true }
        );

        res.status(200).json({ success: true, data: dailyLog, message: "Daily activity report saved successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getChildDailyActivity = async (req, res) => {
    try {
        const ChildDailyActivity = require("../models/ChildDailyActivity");
        const { childId } = req.params;
        const { date } = req.query;

        const queryDate = getNormalizedDate(date);

        const dailyLog = await ChildDailyActivity.findOne({
            childId,
            date: queryDate
        });

        res.status(200).json({ success: true, data: dailyLog });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    registerStaff,
    getStaffMembers,
    getStaffById,
    updateStaff,
    deleteStaff,
    getStaffChildren,
    getChildrenAttendance,
    getAttendanceHistory,
    markChildAttendance,
    addStaffActivity,
    getStaffDashboardSummary,
    getMyProfile,
    updateMyProfile,
    getScheduleActivities,
    markScheduleActivityCompleted,
    addCustomScheduleActivity,
    deleteScheduleActivity,
    logChildDailyActivity,
    getChildDailyActivity
};
