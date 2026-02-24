const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema({
    child: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Child",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["Paid", "Pending"],
        default: "Pending",
    },
    dueDate: {
        type: Date,
        required: true,
    },
}, { timestamps: true });

const Fee = mongoose.model("Fee", feeSchema);

module.exports = Fee;
