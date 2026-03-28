const mongoose = require('mongoose');
const Staff = require('./models/Staff');
const Child = require('./models/Child');
require('dotenv').config();

async function fix() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB. Fixing data...');
        
        let staffRes = await Staff.updateMany({ assignedClass: 'Toddler' }, { $set: { assignedClass: 'Toddler Group' } });
        console.log('Staff Toggle -> Toddler Group:', staffRes);

        let childRes = await Child.updateMany({ class: 'Toddler' }, { $set: { class: 'Toddler Group' } });
        console.log('Child Toggle -> Toddler Group:', childRes);

        console.log('Data fix complete.');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

fix();
