const express = require("express");
const router = express.Router();
const { registerVoter, loginWithFace, verifyOtp } = require("../controllers/authController");

router.post("/register", registerVoter);
router.post("/login/face", loginWithFace);
router.post("/login/verify-otp", verifyOtp);

module.exports = router;
