const express = require("express");
const router = express.Router();
const { getCandidates, addCandidate, deleteCandidate } = require("../controllers/candidateController");
const { protectAdmin } = require("../middleware/authMiddleware");

router.get("/", getCandidates);
router.post("/", protectAdmin, addCandidate);
router.delete("/:id", protectAdmin, deleteCandidate);

module.exports = router;
