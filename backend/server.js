const express = require("express")
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const childRoutes = require("./routes/childRoutes");
const staffRoutes = require("./routes/staffRoutes");
const parentRoutes = require("./routes/parentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const reportRoutes = require("./routes/reportRoutes");
const feeRoutes = require("./routes/feeRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");

dotenv.config();

const app = express();



const cors = require("cors");

app.use(cors({
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("Daycare server is running 🚀 - VERIFICATION_123");
});

app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "Routing test passed!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/children", childRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/feedback", feedbackRoutes);

// Database Connection
connectDB();

const PORT = 5007;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Restart trigger
