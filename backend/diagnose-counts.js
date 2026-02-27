const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Staff = require("./models/Staff");

dotenv.config();

const diagnostics = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB...");

        const users = await User.find({ role: "staff" });
        console.log("--- User Collection (Staff Role) ---");
        users.forEach(u => console.log(`${u.email}: ${u.status}`));

        const staff = await Staff.find({});
        console.log("--- Staff Collection ---");
        staff.forEach(s => console.log(`${s.email}: ${s.status}`));

        const activeStaffInStaff = await Staff.countDocuments({ status: "Active" });
        const activeStaffInUser = await User.countDocuments({ role: "staff", status: "active" });

        console.log(`\nActive Staff in User Collection: ${activeStaffInUser}`);
        console.log(`Active Staff in Staff Collection: ${activeStaffInStaff}`);

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

diagnostics();
