const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const Voter = require("../models/Voter");
const generateToken = require("../utils/generateToken");

// @route POST /api/admin/login
// Body: { email, password }
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken({ id: admin._id, role: "admin" }, "4h");
    res.json({ message: "Admin login successful", token });
  } catch (err) {
    res.status(500).json({ message: "Server error during admin login", error: err.message });
  }
};

// @route GET /api/admin/voters  (list all voters, for verification screen)
exports.listVoters = async (req, res) => {
  try {
    const voters = await Voter.find({}, "-faceDescriptor").sort({ createdAt: -1 });
    res.json(voters);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching voters", error: err.message });
  }
};

// @route PATCH /api/admin/voters/:id/verify
exports.verifyVoter = async (req, res) => {
  try {
    const voter = await Voter.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
    if (!voter) return res.status(404).json({ message: "Voter not found" });
    res.json({ message: "Voter verified", voter });
  } catch (err) {
    res.status(500).json({ message: "Server error verifying voter", error: err.message });
  }
};

// @route PATCH /api/admin/voters/:id/reject
exports.rejectVoter = async (req, res) => {
  try {
    const voter = await Voter.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!voter) return res.status(404).json({ message: "Voter not found" });
    res.json({ message: "Voter rejected/deactivated", voter });
  } catch (err) {
    res.status(500).json({ message: "Server error rejecting voter", error: err.message });
  }
};
