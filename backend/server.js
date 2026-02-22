require("dotenv").config();
const express = require("express");
const connectDB = require("./db");
const cors = require("cors"); // ✅ add cors

const app = express();

// Connect MongoDB
connectDB();

// Middleware
app.use(cors());       // ✅ enable CORS
app.use(express.json());

// Routes
app.use("/users", require("./routes/userRoutes"));

// Test Route
app.get("/", (req, res) => {
  res.send("User Management API Running 🚀");
});

// Start Server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});