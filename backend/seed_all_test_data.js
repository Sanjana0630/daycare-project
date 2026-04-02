require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Child = require('./models/Child');
const Feedback = require('./models/Feedback');

const seedAll = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Create or Find Parent
        let parent = await User.findOne({ email: 'testparent@example.com' });
        if (!parent) {
            parent = await User.create({
                fullName: 'Test Parent',
                email: 'testparent@example.com',
                password: 'password123',
                role: 'parent',
                status: 'active'
            });
            console.log('Created test parent');
        }

        // 2. Create or Find Child
        let child = await Child.findOne({ parent: parent._id });
        if (!child) {
            child = await Child.create({
                childName: 'Baby Test',
                dob: new Date('2021-01-01'),
                gender: 'Male',
                bloodGroup: 'O+',
                admissionDate: new Date('2023-01-01'),
                parentName: parent.fullName,
                parentEmail: parent.email,
                parentPhone: '1234567890',
                emergencyContactName: 'Emergency Contact',
                emergencyContactNumber: '0987654321',
                class: 'Toddler Group',
                parent: parent._id
            });
            console.log('Created test child');
        }

        // 3. Create Mock Feedback
        const mockFeedback = [
            {
                parent: parent._id,
                child: child._id,
                rating: 5,
                category: 'Service',
                message: 'Excellent service! My child loves the teachers and the environment.'
            },
            {
                parent: parent._id,
                child: child._id,
                rating: 4,
                category: 'Food',
                message: 'The food is great, but would love to see more fruit options.'
            },
            {
                parent: parent._id,
                child: child._id,
                rating: 2,
                category: 'Facility',
                message: 'The playground equipment needs some maintenance. It is looking a bit worn out.'
            },
            {
                parent: parent._id,
                child: child._id,
                rating: 1,
                category: 'Activities',
                message: 'Very disappointed with the lack of creative activities this week.'
            },
            {
                parent: parent._id,
                child: child._id,
                rating: 4,
                category: 'Staff',
                message: 'Staff are very professional and caring.'
            }
        ];

        // Clear existing feedback for this parent
        await Feedback.deleteMany({ parent: parent._id });
        
        await Feedback.insertMany(mockFeedback);
        console.log('Successfully seeded mock feedback!');
        
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedAll();
