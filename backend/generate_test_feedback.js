require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Child = require('./models/Child');
const Feedback = require('./models/Feedback');

const seedFeedback = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const parent = await User.findOne({ role: 'parent' });
        if (!parent) {
            console.log('No parent user found. Please register a parent first.');
            process.exit(1);
        }

        const child = await Child.findOne({ parent: parent._id });
        const childFallback = await Child.findOne({ parentEmail: parent.email });
        const finalChild = child || childFallback;

        if (!finalChild) {
            console.log('No child found for this parent. Please add a child first.');
            process.exit(1);
        }

        const mockFeedback = [
            {
                parent: parent._id,
                child: finalChild._id,
                rating: 5,
                category: 'Service',
                message: 'Excellent service! My child loves the teachers and the environment.'
            },
            {
                parent: parent._id,
                child: finalChild._id,
                rating: 4,
                category: 'Food',
                message: 'The food is great, but would love to see more fruit options.'
            },
            {
                parent: parent._id,
                child: finalChild._id,
                rating: 2,
                category: 'Facility',
                message: 'The playground equipment needs some maintenance. It is looking a bit worn out.'
            },
            {
                parent: parent._id,
                child: finalChild._id,
                rating: 1,
                category: 'Activities',
                message: 'Very disappointed with the lack of creative activities this week.'
            },
            {
                parent: parent._id,
                child: finalChild._id,
                rating: 4,
                category: 'Staff',
                message: 'Staff are very professional and caring.'
            }
        ];

        // Clear existing feedback for this parent to avoid clutter
        await Feedback.deleteMany({ parent: parent._id });
        
        await Feedback.insertMany(mockFeedback);
        console.log('Successfully seeded mock feedback!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding feedback:', error);
        process.exit(1);
    }
};

seedFeedback();
