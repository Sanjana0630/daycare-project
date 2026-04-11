const ContactMessage = require('../models/ContactMessage');
const Notification = require('../models/Notification');

/**
 * @desc    Submit a new contact message
 * @route   POST /api/contact
 * @access  Public
 */
const submitContact = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        // 1. Save contact message
        const newContact = await ContactMessage.create({
            name,
            email,
            phone,
            subject,
            message,
        });

        // 2. Generate notification for Admin
        await Notification.create({
            contactId: newContact._id,
            isAdmin: true,
            type: 'CONTACT',
            message: `New contact message from ${name}`,
            isRead: false,
        });

        res.status(201).json({
            success: true,
            data: newContact,
            message: 'Contact message submitted successfully.'
        });
    } catch (error) {
        console.error('Error submitting contact message:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

module.exports = {
    submitContact
};
