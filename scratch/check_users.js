const mongoose = require('mongoose');
const User = require('../backend/models/User');

const MONGO_URI = "mongodb+srv://daycare_admin:mate2003@cluster0.ojy7knq.mongodb.net/careconnect?retryWrites=true&w=majority";

async function checkUsers() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({}, 'fullName email role status');
        console.log('Users in database:');
        console.log(JSON.stringify(users, null, 2));

        process.exit(0);
    } catch (err) {
        console.error('Error connecting/querying:', err);
        process.exit(1);
    }
}

checkUsers();
