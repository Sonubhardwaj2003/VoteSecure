const express = require("express");
const router = express.Router();
const {
  adminLogin,
  listVoters,
  verifyVoter,
  rejectVoter,
} = require("../controllers/adminController");
const { protectAdmin } = require("../middleware/authMiddleware");

router.post("/login", adminLogin);
router.get("/voters", protectAdmin, listVoters);
router.patch("/voters/:id/verify", protectAdmin, verifyVoter);
router.patch("/voters/:id/reject", protectAdmin, rejectVoter);

module.exports = router;
