const FeeStructure = require("../models/FeeStructure");
const Payment = require("../models/Payment");
const Child = require("../models/Child");
const { calculateFee } = require("../utils/feeCalculator");

// Set or Update Fee Structure for a Class
const setFeeStructure = async (req, res) => {
    try {
        const { class: className, monthlyFee, extraCharges } = req.body;
        
        let feeStructure = await FeeStructure.findOne({ class: className });
        if (feeStructure) {
            feeStructure.monthlyFee = monthlyFee;
            feeStructure.extraCharges = extraCharges || 0;
            await feeStructure.save();
        } else {
            feeStructure = await FeeStructure.create({
                class: className,
                monthlyFee,
                extraCharges: extraCharges || 0
            });
        }
        res.status(200).json({ success: true, message: "Fee structure updated", data: feeStructure });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get All Fee Structures
const getFeeStructures = async (req, res) => {
    try {
        const { month, year } = req.query;
        const structures = await FeeStructure.find();
        
        // If specific month/year is requested, return in the specialized format
        if (month && year) {
            const formattedData = structures.map(s => ({
                className: s.class,
                amount: s.monthlyFee
            }));
            return res.status(200).json(formattedData);
        }

        res.status(200).json({ success: true, data: structures });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Dashboard Data (Summary + List for a specific month and year)
const getFeesDashboard = async (req, res) => {
    try {
        const { month, year } = req.query; // 1-12
        
        if (!month || !year) {
            return res.status(400).json({ success: false, message: "Month and year are required" });
        }

        const numericMonth = parseInt(month, 10);
        const numericYear = parseInt(year, 10);

        // Fetch all dependencies
        const children = await Child.find().populate('parent', 'fullName email');
        const feeStructures = await FeeStructure.find();
        const payments = await Payment.find({ month: numericMonth, year: numericYear });

        // Map fee structures by class
        const feesByClass = {};
        feeStructures.forEach(fs => {
            feesByClass[fs.class] = fs.monthlyFee + fs.extraCharges;
        });

        // Current Month Stats
        let totalExpected = 0;
        let totalPaidCurrentMonth = payments.reduce((sum, p) => sum + p.amount, 0);

        const childStatusList = [];
        let overdueCount = 0;

        children.forEach(child => {
            const baseFee = feesByClass[child.class] || 0;
            
            // Find payments for this child for the given month
            const childPayments = payments.filter(p => p.child.toString() === child._id.toString());
            const paidAmount = childPayments.reduce((sum, p) => sum + p.amount, 0);

            // Get the latest payment for receipt generation
            let latestPayment = null;
            let lastPaymentDate = null;
            if (childPayments.length > 0) {
                // Sort by date descending and pick the first
                latestPayment = [...childPayments].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                lastPaymentDate = new Date(latestPayment.date);
            }
            
            // Only stop simulating late fees if the base block is fully paid
            const evalDate = (paidAmount >= baseFee && lastPaymentDate) ? lastPaymentDate : null;

            const feeInfo = calculateFee(child, baseFee, numericYear, numericMonth, evalDate);
            const expectedFee = feeInfo.totalAmount;
            
            let status = 'Pending';
            let pendingAmount = expectedFee - paidAmount;

            if (expectedFee > 0 && paidAmount >= expectedFee) {
                status = 'Paid';
                pendingAmount = 0;
            }

            // Check if overdue
            const today = new Date();
            if (status === 'Pending' && expectedFee > 0) {
                if (today > feeInfo.graceEnd) {
                    status = 'Overdue';
                    overdueCount++;
                }
            }

            totalExpected += expectedFee;

            childStatusList.push({
                _id: child._id,
                childName: child.childName,
                photo: child.photo,
                class: child.class,
                parentName: child.parent ? child.parent.fullName : child.parentName,
                parentEmail: child.parent ? child.parent.email : child.parentEmail,
                admissionDate: child.admissionDate,
                baseFee: feeInfo.baseFee,
                lateFee: feeInfo.lateFee,
                dueDate: feeInfo.dueDate,
                graceEnd: feeInfo.graceEnd,
                lastPaymentDate,
                latestPayment: latestPayment ? {
                    _id: latestPayment._id,
                    amount: latestPayment.amount,
                    date: latestPayment.date,
                    mode: latestPayment.mode,
                    month: latestPayment.month,
                    year: latestPayment.year,
                    child: {
                        childName: child.childName,
                        parentName: child.parent ? child.parent.fullName : child.parentName,
                        class: child.class
                    }
                } : null,
                expectedFee,
                paidAmount,
                pendingAmount,
                status
            });
        });

        const pendingFees = totalExpected - totalPaidCurrentMonth;

        res.status(200).json({
            success: true,
            summary: {
                totalCollected: totalPaidCurrentMonth,
                pendingFees: pendingFees > 0 ? pendingFees : 0,
                paidThisMonth: totalPaidCurrentMonth,
                overdueCount
            },
            children: childStatusList,
            recentPayments: await Payment.find({ month: numericMonth, year: numericYear }).sort({ date: -1 }).limit(5).populate('child', 'childName parentName')
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Record a Payment
const recordPayment = async (req, res) => {
    try {
        const { childId, amount, date, month, year, mode } = req.body;
        
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({ success: false, message: "Valid amount is required" });
        }

        const paymentDate = new Date(date);

        const newPayment = await Payment.create({
            child: childId,
            amount: numericAmount,
            date: paymentDate,
            month: parseInt(month, 10),
            year: parseInt(year, 10),
            mode
        });

        res.status(201).json({ success: true, message: "Payment recorded successfully", data: newPayment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Send Reminder Notification
const sendReminder = async (req, res) => {
    try {
        const { childId, month, year } = req.body;
        
        const child = await Child.findById(childId).populate('parent');
        
        if (!child) {
            return res.status(404).json({ success: false, message: "Child not found" });
        }

        // Simulating sending email/notification
        console.log(`[Notification] Reminder sent to ${child.parentEmail} for pending fees of ${child.childName} for ${month}/${year}`);

        res.status(200).json({ success: true, message: "Reminder sent successfully" });
    } catch (error) {
         res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    setFeeStructure,
    getFeeStructures,
    getFeesDashboard,
    recordPayment,
    sendReminder
};
