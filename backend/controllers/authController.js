const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Check Admin Credentials from .env
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (email === adminEmail && password === adminPassword) {
            const adminId = "65f1a2b2c3d4e5f6a7b8c9d0"; // Valid 24-char hex string
            return res.json({
                _id: adminId,
                fullName: "Administrator",
                email: adminEmail,
                role: "admin",
                token: generateToken(adminId),
            });
        }

        // 2. Check Database for regular users
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                status: user.status, // Added status to response
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { fullName, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const user = await User.create({
            fullName,
            email,
            password,
            role,
            status: role === "staff" ? "pending" : "active",
        });

        if (user) {
            res.status(201).json({
                message: "Account created successfully!",
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const getParents = async (req, res) => {
    try {
        const parents = await User.find({ role: "parent" }).select("_id fullName email");
        res.status(200).json({ success: true, data: parents });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const getMe = async (req, res) => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminId = "65f1a2b2c3d4e5f6a7b8c9d0";

        // Check if current user is the hardcoded Admin
        if (req.user._id.toString() === adminId || req.user.email === adminEmail) {
            return res.json({
                success: true,
                data: {
                    _id: adminId,
                    fullName: "Administrator",
                    email: adminEmail,
                    role: "admin",
                    profileImage: null
                }
            });
        }

        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            success: true,
            data: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage
            }
        });
    } catch (error) {
        console.error('Error in getMe:', error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { loginUser, registerUser, getParents, getMe };
