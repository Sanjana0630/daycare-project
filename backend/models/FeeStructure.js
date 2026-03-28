const mongoose = require("mongoose");

const feeStructureSchema = new mongoose.Schema({
    class: {
        type: String,
        required: true,
        unique: true,
    },
    monthlyFee: {
        type: Number,
        required: true,
    },
    extraCharges: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

const FeeStructure = mongoose.model("FeeStructure", feeStructureSchema);

module.exports = FeeStructure;
