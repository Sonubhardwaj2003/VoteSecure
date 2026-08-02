const mongoose = require("mongoose");

const voterSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    voterId: { type: String, required: true, unique: true, trim: true }, // mock govt ID (e.g. Aadhaar-style number)
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    constituency: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },

    // 128-length face descriptor array produced by face-api.js during registration
    faceDescriptor: {
      type: [Number],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length === 128,
        message: "faceDescriptor must contain exactly 128 numbers",
      },
    },

    hasVoted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false }, // set true after admin approves registration
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Voter", voterSchema);
