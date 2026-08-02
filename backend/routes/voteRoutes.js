const express = require("express");
const router = express.Router();
const { castVote, getResults } = require("../controllers/voteController");
const { protectVoter } = require("../middleware/authMiddleware");

router.post("/cast", protectVoter, castVote);
router.get("/results", getResults);

module.exports = router;
