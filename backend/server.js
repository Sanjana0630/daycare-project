const express = require("express")
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const childRoutes = require("./routes/childRoutes");
const staffRoutes = require("./routes/staffRoutes");
const parentRoutes = require("./routes/parentRoutes");
const adminRoutes = require("./routes/adminRoutes");

dotenv.config();

const app = express();



const cors = require("cors");

app.use(cors({
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Daycare server is running 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/children", childRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/admin", adminRoutes);

// Database Connection
connectDB();

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
