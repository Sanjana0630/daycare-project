const mongoose = require('mongoose');
const Attendance = require('./models/Attendance');
const Staff = require('./models/Staff');
const fs = require('fs');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const records = await Attendance.find({}).sort({ updatedAt: -1 }).limit(5).populate('markedBy');
        fs.writeFileSync('output.json', JSON.stringify(records, null, 2));
        process.exit(0);
    })
    .catch(err => {
        fs.writeFileSync('output.json', JSON.stringify({ error: err.toString() }));
        process.exit(1);
    });
