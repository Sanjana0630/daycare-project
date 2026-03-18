const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const Child = require('./backend/models/Child');

async function checkPhotos() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        const children = await Child.find({}, 'childName photo');
        console.log('Children info:');
        children.forEach(c => {
            console.log(`${c.childName}: "${c.photo}"`);
        });
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkPhotos();
