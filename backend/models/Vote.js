const mongoose = require("mongoose");

// We store a hashed reference to the voter (not raw identity) alongside the
// candidate voted for, so results can be tallied/audited without exposing
// who voted for whom in plaintext queries.
const voteSchema = new mongoose.Schema(
  {
    voterHash: { type: String, required: true }, // sha256(voterId + secret)
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },
    constituency: { type: String, required: true },
    castAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vote", voteSchema);
