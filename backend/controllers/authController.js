const Voter = require("../models/Voter");
const Otp = require("../models/Otp");
const generateToken = require("../utils/generateToken");
const { generateOTPCode, sendOTPEmail } = require("../utils/sendOTP");
const { isFaceMatch } = require("../utils/faceMatch");

// @route POST /api/auth/register
// Body: { fullName, voterId, email, phone, constituency, dateOfBirth, faceDescriptor }
exports.registerVoter = async (req, res) => {
  try {
    const { fullName, voterId, email, phone, constituency, dateOfBirth, faceDescriptor } = req.body;

    if (!fullName || !voterId || !email || !phone || !constituency || !dateOfBirth || !faceDescriptor) {
      return res.status(400).json({ message: "All fields including a captured face are required" });
    }

    const existing = await Voter.findOne({ $or: [{ voterId }, { email }] });
    if (existing) {
      return res.status(409).json({ message: "Voter with this ID or email already registered" });
    }

    // Prevent registering a face that's already tied to another voter
    // (basic 1-face-1-identity check across the whole DB)
    const allVoters = await Voter.find({}, "faceDescriptor voterId");
    for (const v of allVoters) {
      const { match } = isFaceMatch(v.faceDescriptor, faceDescriptor);
      if (match) {
        return res.status(409).json({
          message: "This face appears to already be registered under a different Voter ID",
        });
      }
    }

    const voter = await Voter.create({
      fullName,
      voterId,
      email,
      phone,
      constituency,
      dateOfBirth,
      faceDescriptor,
    });

    res.status(201).json({
      message: "Registration successful. Please wait for admin verification before you can vote.",
      voterId: voter.voterId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during registration", error: err.message });
  }
};

// @route POST /api/auth/login/face
// Step 1 of login: match live face against stored descriptor, then send OTP
// Body: { voterId, faceDescriptor }
exports.loginWithFace = async (req, res) => {
  try {
    const { voterId, faceDescriptor } = req.body;
    if (!voterId || !faceDescriptor) {
      return res.status(400).json({ message: "voterId and faceDescriptor are required" });
    }

    const voter = await Voter.findOne({ voterId });
    if (!voter) return res.status(404).json({ message: "Voter not found" });

    if (!voter.isVerified) {
      return res.status(403).json({ message: "Your registration is not yet verified by admin" });
    }
    if (voter.hasVoted) {
      return res.status(403).json({ message: "You have already cast your vote" });
    }

    const { match, distance, threshold } = isFaceMatch(voter.faceDescriptor, faceDescriptor);
    if (!match) {
      return res.status(401).json({
        message: "Face does not match our records. Please try again with better lighting.",
        distance,
        threshold,
      });
    }

    // Face matched -> send OTP as second factor
    const code = generateOTPCode();
    await Otp.deleteMany({ voterId }); // clear any old OTPs
    await Otp.create({ voterId, code });
    await sendOTPEmail(voter.email, code);

    res.json({ message: "Face verified. OTP sent to your registered email.", maskedEmail: maskEmail(voter.email) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during face login", error: err.message });
  }
};

// @route POST /api/auth/login/verify-otp
// Step 2 of login: verify OTP, issue JWT
// Body: { voterId, code }
exports.verifyOtp = async (req, res) => {
  try {
    const { voterId, code } = req.body;
    if (!voterId || !code) return res.status(400).json({ message: "voterId and code are required" });

    const record = await Otp.findOne({ voterId, code });
    if (!record) return res.status(401).json({ message: "Invalid or expired OTP" });

    const voter = await Voter.findOne({ voterId });
    if (!voter) return res.status(404).json({ message: "Voter not found" });

    await Otp.deleteMany({ voterId }); // OTP is single-use

    const token = generateToken({ id: voter._id, voterId: voter.voterId, role: "voter" }, "15m");

    res.json({
      message: "Login successful",
      token,
      voter: {
        fullName: voter.fullName,
        voterId: voter.voterId,
        constituency: voter.constituency,
        hasVoted: voter.hasVoted,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during OTP verification", error: err.message });
  }
};

function maskEmail(email) {
  const [name, domain] = email.split("@");
  if (name.length <= 2) return `${name[0]}***@${domain}`;
  return `${name.slice(0, 2)}***@${domain}`;
}
