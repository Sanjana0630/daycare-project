const Feedback = require("../models/Feedback");

// @desc    Get all public feedback
// @route   GET /api/feedback
// @access  Public
const getPublicFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find({ isHidden: false })
            .populate("parent", "name")
            .populate("child", "childName")
            .sort({ createdAt: -1 })
            .lean();

        // Format data to simplify frontend access
        const formattedFeedback = feedback.map(item => ({
            _id: item._id,
            parentName: item.parent?.name || "Parent",
            childName: item.child?.childName,
            rating: item.rating,
            message: item.message,
            category: item.category,
            createdAt: item.createdAt
        }));

        res.status(200).json({
            success: true,
            count: formattedFeedback.length,
            data: formattedFeedback
        });
    } catch (error) {
        console.error('Error in getPublicFeedback:', error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    getPublicFeedback
};
