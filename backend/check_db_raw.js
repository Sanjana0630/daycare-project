const mongoose = require('mongoose');
const Attendance = require('./models/Attendance');
const fs = require('fs');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        // NOT populating markedBy to see the RAW stored ObjectId
        const records = await Attendance.find({}).sort({ updatedAt: -1 }).limit(2);
        fs.writeFileSync('output_raw.json', JSON.stringify(records, null, 2));
        process.exit(0);
    })
    .catch(err => {
        process.exit(1);
    });
