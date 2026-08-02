require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const voteRoutes = require("./routes/voteRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json({ limit: "10mb" })); // face descriptor arrays can be sizeable

app.use("/api/auth", authRoutes);
app.use("/api/vote", voteRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Online Voting System API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
