const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    child: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Child",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    month: {
        type: Number, // 1 for January, etc.
        required: true,
    },
    year: {
        type: Number,
        required: true,
    },
    lateFee: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ["Paid", "Pending"],
        default: "Paid",
    },
    mode: {
        type: String,
        enum: ["Cash", "UPI", "Card"],
        required: true,
    },
}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
