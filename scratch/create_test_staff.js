const mongoose = require('mongoose');
const User = require('../backend/models/User');
const Staff = require('../backend/models/Staff');

const MONGO_URI = "mongodb+srv://daycare_admin:mate2003@cluster0.ojy7knq.mongodb.net/careconnect?retryWrites=true&w=majority";

async function createStaff() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Delete existing test staff to start fresh
        await User.deleteOne({ email: 'teststaff@example.com' });
        await Staff.deleteOne({ email: 'teststaff@example.com' });
        console.log('Cleared existing test staff user & profile');

        // Create new User with role staff, status active
        const user = await User.create({
            fullName: 'Test Staff Member',
            email: 'teststaff@example.com',
            password: 'Password123!',
            role: 'staff',
            status: 'active'
        });
        console.log('Created User record:', user._id);

        process.exit(0);
    } catch (err) {
        console.error('Error creating staff:', err);
        process.exit(1);
    }
}

createStaff();
