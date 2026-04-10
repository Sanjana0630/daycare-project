const express = require('express');
const { submitContact } = require('../controllers/contactController');

const router = express.Router();

// @route   POST /api/contact
// @desc    Submit a contact message
// @access  Public
router.post('/', submitContact);

module.exports = router;
