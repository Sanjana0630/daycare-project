const mongoose = require("mongoose");
const Child = require("./models/Child");
const dotenv = require("dotenv");

dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const testChild = new Child({
            childName: "Test Child " + Date.now(),
            dob: new Date("2020-01-01"),
            gender: "Male",
            bloodGroup: "O+",
            admissionDate: new Date(),
            parentName: "Parent Name",
            parentEmail: "parent@test.com",
            parentPhone: "1234567890",
            emergencyContactName: "Emergency",
            emergencyContactNumber: "0987654321",
            photo: "/uploads/test-photo.jpg"
        });

        const saved = await testChild.save();
        console.log("Saved child with photo:", saved.photo);

        const found = await Child.findById(saved._id);
        console.log("Found child in DB. Photo:", found.photo);

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

test();
