const mongoose = require('mongoose');
const User = require('./models/User');
const Staff = require('./models/Staff');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const id = "69a84ddfe48229a5e009ce25";
        const user = await User.findById(id);
        const staff = await Staff.findById(id);

        console.log("Is it a User?", !!user);
        console.log("Is it a Staff?", !!staff);
        process.exit(0);
    });
