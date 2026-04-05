const cron = require("node-cron");
const Child = require("../models/Child");
const Payment = require("../models/Payment");
const Fee = require("../models/Fee");
const Notification = require("../models/Notification");
const FeeStructure = require("../models/FeeStructure");
const { calculateFee } = require("../utils/feeCalculator");

const initFeeCron = () => {
    // Run at 09:00 AM every day
    // cron.schedule("0 9 * * *", async () => {
    
    // For testing/demonstration, you might run it more frequently (e.g., every minute)
    // For production: "0 9 * * *"
    cron.schedule("0 9 * * *", async () => {
        console.log("[Cron] Checking for pending fees...");
        try {
            const today = new Date();
            const currentMonth = today.getMonth() + 1; // 1-12
            const currentYear = today.getFullYear();

            const children = await Child.find().populate('parent');
            const feeStructures = await FeeStructure.find();
            
            const feesByClass = {};
            feeStructures.forEach(fs => {
                feesByClass[fs.class] = fs.monthlyFee + fs.extraCharges;
            });

            for (const child of children) {
                const baseFee = feesByClass[child.class] || 0;
                
                // 1. Check if payment exists for this month/year
                const payment = await Payment.findOne({
                    child: child._id,
                    month: currentMonth,
                    year: currentYear
                });

                if (!payment) {
                    // 2. Calculate due date
                    const feeInfo = calculateFee(child, baseFee, currentYear, currentMonth);
                    const dueDate = feeInfo.dueDate;

                    // 3. If today is past due date, send reminder
                    if (today > dueDate) {
                        // Find or create Fee tracking record
                        let feeRecord = await Fee.findOne({
                            child: child._id,
                            month: currentMonth,
                            year: currentYear
                        });

                        if (!feeRecord) {
                            feeRecord = await Fee.create({
                                child: child._id,
                                amount: feeInfo.totalAmount,
                                dueDate: dueDate,
                                month: currentMonth,
                                year: currentYear,
                                status: "Pending",
                                isPaid: false
                            });
                        }

                        // 4. Send notification if not sent today
                        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
                        if (!feeRecord.lastReminderSent || feeRecord.lastReminderSent < startOfToday) {
                            
                            // Create in-app notification
                            if (child.parent) {
                                await Notification.create({
                                    parentId: child.parent._id,
                                    childId: child._id,
                                    feeId: feeRecord._id,
                                    generatedBy: child.parent._id, // System notification, using parent as placeholder or an admin ID
                                    type: "FEE",
                                    message: `⚠️ Fee overdue! Your child's (${child.childName}) fee for ${today.toLocaleString('default', { month: 'long' })} ${currentYear} is pending. Please pay immediately.`
                                });

                                // Update last reminder timestamp
                                feeRecord.lastReminderSent = new Date();
                                await feeRecord.save();
                                
                                console.log(`[Cron] Sent fee reminder to ${child.parent.fullName} for ${child.childName}`);
                            }
                        }
                    }
                } else {
                    // If payment exists, ensure Fee record is marked as paid
                    await Fee.findOneAndUpdate(
                        { child: child._id, month: currentMonth, year: currentYear },
                        { isPaid: true, status: "Paid" }
                    );
                }
            }
            console.log("[Cron] Fee check completed.");
        } catch (error) {
            console.error("[Cron] Error in fee checking job:", error);
        }
    });
};

module.exports = initFeeCron;
