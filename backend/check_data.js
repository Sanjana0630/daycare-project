const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const ChildDailyActivitySchema = new mongoose.Schema({
    childId: mongoose.Schema.Types.ObjectId,
    date: Date,
    activities: [{
        activityName: String,
        completed: Boolean,
        rating: Number,
        notes: String
    }]
});

const ChildDailyActivity = mongoose.model('ChildDailyActivity', ChildDailyActivitySchema);

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const count = await ChildDailyActivity.countDocuments();
        console.log(`Total Activity Logs: ${count}`);

        if (count > 0) {
            const latest = await ChildDailyActivity.find().sort({ date: -1 }).limit(5);
            console.log('Latest Logs:', JSON.stringify(latest, null, 2));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
