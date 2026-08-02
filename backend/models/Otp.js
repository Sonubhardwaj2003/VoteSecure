const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  voterId: { type: String, required: true },
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // auto-delete after 5 minutes
});

module.exports = mongoose.model("Otp", otpSchema);
