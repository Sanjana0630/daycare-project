const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (decoded.id === "admin-id") {
                req.user = { _id: "admin-id", role: "admin", fullName: "Administrator" };
            } else {
                req.user = await User.findById(decoded.id).select("-password");
            }

            if (!req.user) {
                return res.status(401).json({ message: "Not authorized, user not found" });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        res.status(401).json({ message: "Not authorized, no token" });
    }
};

// Generic authorize middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Role (${req.user ? req.user.role : 'none'}) is not authorized to access this route` });
        }
        next();
    };
};

// Legacy role middlewares (kept for compatibility)
const parent = (req, res, next) => {
    if (req.user && req.user.role === "parent") {
        next();
    } else {
        res.status(403).json({ message: "Not authorized as a parent" });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ message: "Not authorized as an admin" });
    }
};

module.exports = { protect, authorize, parent, admin };
